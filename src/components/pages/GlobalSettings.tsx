// GLOBALS
import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import JSZip from 'jszip';
import * as AWS from 'aws-sdk';
import { marked } from 'marked';
// COMPONENTS
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import Modal from '@mui/material/Modal';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Slider from '@mui/material/Slider';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
// DATA/UTILS
import { checkIfSysex } from '../../utilities/checkIfSysex';
import { FirmwareVersionResponse, GlobalSettingsProps, GlobalSettingsResponse, MidiOutputRef } from '../../types';
import { identifyOutput } from '../../utilities/identifyOutput';
import { commandBytes, messages } from '../../assets/dictionary';
import { AWS_ACCESS_KEY, AWS_SECRET, footswitchFunctions, markdownInstructions, messageDelay, mfxId1, mfxId2, mfxId3, midiInputChannelOptions } from '../../utilities/constants';
import { debounce } from '../../utilities/debounce';
import { parseInstalledFirmwareVersion } from '../../utilities/firmwareVersionParsing';
import { calculateMidiClockValues } from '../../utilities/calculateMidiClockValues';
import { splitSysExMessages } from '../../utilities/splitSysExMessages.ts';

const modalStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 'fit-content',
    maxHeight: '80vh',
    overflowY: 'auto',
    bgcolor: '#313239',
    border: '2px solid #000',
    color: 'white',
    boxShadow: 24,
    p: 4,
  };

const GlobalSettings: React.FC<GlobalSettingsProps> = ({ midiAccess, status, deviceSettings }) => {
    const footswitchDropdownValuesInitialState = {
        switch1Function: footswitchFunctions[0],
        switch2Function: footswitchFunctions[0],
        switch3Function: footswitchFunctions[0],
        switch4Function: footswitchFunctions[0],
        switch5Function: footswitchFunctions[0],
        switch6Function: footswitchFunctions[0],
        switch7Function: footswitchFunctions[0],
    }

    const [globalSettingsRes, setGlobalSettingsRes] = useState<GlobalSettingsResponse>(deviceSettings);

    const [bpm, setBpm] = useState<number>(0);
    const [bpmError, setBpmError] = useState<boolean>(false);

    const [footswitchDropdownValues, setFootswitchDropdownValues] = useState<object>(footswitchDropdownValuesInitialState);

    const [firmwareModalOpen, setFirmwareModalOpen] = useState<boolean>(false);
    const [showUpdateDropdown, setShowUpdateDropdown] = useState<boolean>(false);
    const [updateDropdownOptions, setUpdateDropdownOptions] = useState<AWS.S3.ObjectList>([]);
    const [showLocalUpdateVersion, setShowLocalUpdateVersion] = useState<boolean>(false);
    const [isFirmwareLoaded, setIsFirmwareLoaded] = useState<boolean>(false);

    const [markdownContent, setMarkdownContent] = useState<string>('');
    const [installedFirmwareVersion, setInstalledFirmwareVersion] = useState<string>('');
    const [selectedUpdateFile, setSelectedUpdateFile] = useState<Uint8Array | null>(null);
    const [selectedCloudUpdateFile, setSelectedCloudUpdateFile] = useState<string>('');
    const [selectedLocalUpdateFile, setSelectedLocalUpdateFile] = useState<string>('Not Selected');

    const [downloadProgress, setDownloadProgress] = useState<number>(0);
    const [showProgressBar, setShowProgressBar] = useState<boolean>(false);

    let output: MidiOutputRef = useRef({} as WebMidi.MIDIOutput);

    const validateBpm = (value: string) => {
        const valueAsNum = parseInt(value);
        // Validation for Midi Clock BPM
        if(valueAsNum < 30 && valueAsNum !== 0) {
            setBpmError(true);
            updateSetting('midiClockMsb', 30);
        }
        else if(valueAsNum > 300) {
            setBpmError(true);
            updateSetting('midiClockMsb', 300);
        }
        else {
            setBpmError(false); 
        }
    }

    const handleBpmInput = debounce((value: string) => {
        validateBpm(value);
        updateSetting('midiClockMsb', value);
      }, 1000);

    const handleBpmChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;
        setBpm(parseInt(value));
        handleBpmInput(value);
    }

    const handleZipFile = (zipData: AWS.S3.Body | File) => {
        console.log('Processing ZIP file');
        //@ts-ignore
        JSZip.loadAsync(zipData).then(zip => {
            zip.forEach((relativePath, zipEntry) => {
                console.log('Found entry in ZIP:', zipEntry.name);
                if (zipEntry.name.endsWith('.syx')) {
                    zipEntry.async('arraybuffer').then(content => {
                        setSelectedUpdateFile(new Uint8Array(content));
                        setIsFirmwareLoaded(true);
                        alert('file loaded from cloud');
                    });
                } else if (zipEntry.name.endsWith('.txt')) {
                    zipEntry.async('text').then(async content => {
                        console.log('Text file content:', content);
                        const newMarkdown = await marked.parse(content);
                        setMarkdownContent(newMarkdown);
                    });
                }
            });
        }).catch(error => {
            console.error('Error handling ZIP file:', error);
            alert('Error handling ZIP file: ' + error.message);
        });
    }

    function listFilesFromS3(bucketName: string) {
        AWS.config.update({
            region: 'us-west-2',
            credentials: new AWS.Credentials(AWS_ACCESS_KEY, AWS_SECRET)
        });

        const s3 = new AWS.S3();
        const params = {
            Bucket: bucketName
        };

        s3.listObjectsV2(params, (err, data) => {
            if (err) {
                console.error('Error listing files from cloud:', err);
                alert('Error listing files from cloud: ' + err.message);
            } else if(data.Contents) {
                const files = data.Contents;

                // Sort files by LastModified date in descending order (newest first)
                files.sort((a, b) => {
                    let result = 0;
                    if(b.LastModified && a.LastModified) {
                       result = b.LastModified > a.LastModified ? 1 : -1;
                    }

                    return result;
                });

                setUpdateDropdownOptions(files);

                // Set the first (newest) file as the selected option
                const newestFile = files[0];
                if(newestFile.Key) {
                    setSelectedCloudUpdateFile(newestFile.Key);
                    fetchFileFromS3(bucketName, newestFile.Key); // Automatically fetch the newest file
                }
            }
        });
    }

    const fetchFileFromS3 = (bucketName: string, key: string) => {
        AWS.config.update({
            region: 'us-west-2',
            credentials: new AWS.Credentials(AWS_ACCESS_KEY, AWS_SECRET)
        });

        const s3 = new AWS.S3();
        const params = {
            Bucket: bucketName,
            Key: key
        };

        s3.getObject(params, (error, data) => {
            if (error) {
                console.error('Error fetching file:', error);
                alert('Error fetching file: ' + error.message);
            } else if(data.Body) {
                // Handle the file based on its extension
                if (key.endsWith('.zip')) {
                    handleZipFile(data.Body);
                } else if (key.endsWith('.syx')) {
                    const encoder = new TextEncoder();
                    const bodyAsArray = encoder.encode(data.Body.toString());

                    setSelectedUpdateFile(bodyAsArray);
                    setIsFirmwareLoaded(true);
                    alert('file loaded from cloud');
                } else {
                    alert('Unsupported file type. Please select a .syx or .zip file from the cloud.');
                }
            }
        });
    }

    const handleUpdateModal = async () => {
        if(output.current?.send) {
            output.current.send(messages.firmwareUpdateVersionRequest.messageData);
        }

        const markdown = await marked.parse(markdownInstructions);
        setMarkdownContent(markdown);
        setFirmwareModalOpen(true);
    }

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedLocalUpdateFile(file.name);
            setShowLocalUpdateVersion(true);

            if (file.name.endsWith('.zip')) {
                handleZipFile(file);
            } else if (file.name.endsWith('.syx')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const result = e.target?.result;
                    if(result && typeof result !== 'string') {
                        setSelectedUpdateFile(new Uint8Array(result));
                        setIsFirmwareLoaded(true);
                    }
                };
                reader.readAsArrayBuffer(file);
            } else {
                alert('Unsupported file type. Please upload a .syx or .zip file.');
            }
        }
    };

    const handleSelectCloudFile = (event: SelectChangeEvent) => {
        setSelectedCloudUpdateFile(event.target.value);
        fetchFileFromS3('matthewseffects-futuristfirmware', event.target.value);
    }

    const handleUpdateFromFile = () => {
        setShowUpdateDropdown(false);
        setSelectedUpdateFile(null);
        document.getElementById('fileInput')?.click();
    }

    const handleUpdateFromWeb = () => {
        setShowLocalUpdateVersion(false);
        listFilesFromS3('matthewseffects-futuristfirmware');
        setSelectedUpdateFile(null);
        setShowUpdateDropdown(true);
    };

    const resetModalDefaults = () => {
        setShowUpdateDropdown(false);
        setUpdateDropdownOptions([]);
        setShowLocalUpdateVersion(false);
        setIsFirmwareLoaded(false);

        setMarkdownContent('');
        setInstalledFirmwareVersion('');
        setSelectedUpdateFile(null);
        setSelectedCloudUpdateFile('');
        setSelectedLocalUpdateFile('Not Selected');
    }

    const sendSysExData = (selectedOutput: WebMidi.MIDIOutput, data: Uint8Array, delay: number) => {
        const sendNextMessage = (messages: number[][], index: number) => {
            if (index < messages.length) {
                const message = messages[index];
                selectedOutput.send(message);

                // Update progress bar
                const progress = Math.round(((index + 1) / messages.length) * 100);
                setDownloadProgress(progress);

                setTimeout(() => {
                    sendNextMessage(messages, index + 1);
                }, delay); // Fixed delay between messages
            } else {
                alert('All data sent!');
                setShowProgressBar(false);
                closeModal();
            }
        }

        const messages = splitSysExMessages(data);
        sendNextMessage(messages, 0);  
    }

    const handleUpdateFirmware = () => {
        if (output.current && selectedUpdateFile) {
            setShowProgressBar(true);
            setDownloadProgress(0);
            sendSysExData(output.current, selectedUpdateFile, messageDelay);
        } else {
            alert('Please select a MIDI device and upload a SysEx file.');
        }
    }

    const closeModal = () => {
        setFirmwareModalOpen(false);
        resetModalDefaults();
    }
    
    const updateSetting = (setting: string, newValue: string | number) => {
        const valueAsNum = typeof newValue === 'string' ? parseInt(newValue) : newValue;
        const newSettings = { ...globalSettingsRes, [setting]: valueAsNum };

        // Invert contrast
        if(setting === 'contrast') {
            newSettings.contrast = Math.abs(valueAsNum - 10);
        }

        // Additional logic for Switch Functions
        // If a Tap function is selected, update appropriate Midi Clock Tap settings as well
        if(setting.includes('switch')) {
            const switchNumber = parseInt(setting.substring(6, 7));

            if(valueAsNum === 5) {
                setFootswitchDropdownValues({...footswitchDropdownValues, [setting]: footswitchFunctions[5]});
                newSettings.tapStatus = switchNumber - 1;
                newSettings.tapStatusMode = 1;
            }
            else if(valueAsNum === 6) {
                setFootswitchDropdownValues({...footswitchDropdownValues, [setting]: footswitchFunctions[6]});
                newSettings.tapStatus = switchNumber - 1;
                newSettings.tapStatusMode = 0;
            }
            else {
                setFootswitchDropdownValues({...footswitchDropdownValues, [setting]: footswitchFunctions[valueAsNum]});
                newSettings[setting] = valueAsNum;
                if(newSettings.tapStatus !== 127) newSettings.tapStatus = 127;
            }
        }

        if(setting.includes('sb') && !bpmError) {
            newSettings.midiClockLsb = calculateMidiClockValues(valueAsNum).LSB;
            newSettings.midiClockMsb = calculateMidiClockValues(valueAsNum).MSB;
        }

        setGlobalSettingsRes(newSettings);

        // Only send the MIDI write message if validation is satisfied
        if(((setting !== 'midiClockMsb') || (setting === 'midiClockMsb' && !bpmError))) { 
            const messageToWrite = Object.values(newSettings);
            // First add Start of Message to beginning of array, then add EOX to end of array
            messageToWrite.unshift(0xf0);
            messageToWrite.push(0xf7);
            // Set command byte to "global settings write"
            messageToWrite[6] = 0x22;
            console.log('Mess to write: ', messageToWrite);
            if(output.current?.send) {
                output.current?.send(messageToWrite);
            }
        }
    }

    useEffect(() => {
        const handleMidiMessage = (event: WebMidi.MIDIMessageEvent) => {
            console.log('Midi Message Received: ', event.data);
            // TODO: Write function for parsing based on the response that was sent
            if (checkIfSysex(event.data)) {
              // Parse response into the appropriate object
              const commandFromResponse = event.data[6];
              //@ts-ignore
              const responseType = Object.keys(commandBytes).find(key => commandBytes[key] === commandFromResponse);
        
              switch(responseType) {
                case 'globalSettingsResponse': 
                  const gSResponse: GlobalSettingsResponse = {
                  // MFX IDs should be constant
                  mfxId1: mfxId1,
                  mfxId2: mfxId2,
                  mfxId3: mfxId3,
                  productIdLsb: event.data[4],
                  productIdMsb: event.data[5],
                  commandByte: event.data[6],
                  tapStatus: event.data[7],
                  tapStatusMode: event.data[8],
                  switch1Function: event.data[9],
                  switch2Function: event.data[10],
                  switch3Function: event.data[11],
                  switch4Function: event.data[12],
                  switch5Function: event.data[13],
                  switch6Function: event.data[14],
                  switch7Function: event.data[15],
                  contrast: event.data[16],
                  brightness: event.data[17],
                  controlJackMode: event.data[18],
                  midiClockState: event.data[19],
                  midiClockLsb: event.data[20],
                  midiClockMsb: event.data[21],
                  utilityJackPolarity: event.data[22],
                  utilityJackMode: event.data[23],
                  midiInputChannel: event.data[24],
                };
                setGlobalSettingsRes(gSResponse);
                break;
              case 'firmwareVersionResponse':
                const fvResponse: FirmwareVersionResponse = {
                mfxId1: mfxId1,
                mfxId2: mfxId2,
                mfxId3: mfxId3,
                productIdMsb: event.data[4],
                productIdLsb: event.data[5],
                commandByte: event.data[6],
                majorVersion10: event.data[7],
                majorVersion1: event.data[8],
                minorVersion10: event.data[9],
                minorVersion1: event.data[10]
                };
                setInstalledFirmwareVersion(parseInstalledFirmwareVersion(fvResponse));
                break;
            default:
              }
            }
          }

        if(midiAccess) {
            if(midiAccess.inputs.size > 0 && midiAccess.outputs.size > 0) {
            midiAccess?.inputs.forEach((input) => input.onmidimessage = handleMidiMessage);
            output.current = identifyOutput(midiAccess);
            }
        }
    }, [])

    // useEffect(() => {
    //     const sendInitialMessage = async () => {
    //         try {
    //           if (output.current?.state === 'connected' && output.current?.connection !== 'open') {
    //             await output.current.open();
    //             if(output.current?.send) {
    //                 console.log('Initial GS Mess to send: ', messages.globalSettingsRequest.messageData)
    //                 output.current.send(messages.globalSettingsRequest.messageData);
    //             }   
    //           }    
    //         } catch (error) {
    //           console.error('Failed to send MIDI message', error);
    //         }
    //       };

    //     //   sendInitialMessage();

    //     // Retrieve Global Settings on page load
    //     // console.log('Current output: ', output.current)
    //     // if(output.current?.send) {
    //     //     console.log('Initial GS Mess to send: ', messages.globalSettingsRequest.messageData)
    //     //     output.current.send(messages.globalSettingsRequest.messageData);
    //     // }
    // }, [])

    // if(!output.current || output.current.state === 'disconnected' || output.current.connection !== 'open') {
    //     return <CircularProgress />
    // }

    return (
        <>
        {status === 'disconnected' && <h1>Please connect a device.</h1>}
        {status === 'connected' && <>
        <h1>Global Settings</h1>
            <div>
                <Grid container spacing={2}>
                    <Grid item xs={3}>
                    <div style={{ backgroundColor: '#0f0e13', borderRadius: '3%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '55vh', marginLeft: '5px' }}>
                        <h3>Foot Switch Settings</h3>
                        <div>
                        <span style={{ width: '100%' }}>
                            <FormControl>
                                <Select
                                    autoWidth
                                    id="sw1"
                                    value={globalSettingsRes.switch1Function}
                                    onChange={(event) => updateSetting('switch1Function', event.target.value)}
                                    style={{ backgroundColor: 'gray', color: 'white', height: '2rem', width: '10rem', marginBottom: '10px', marginLeft: '10px' }}
                                    >
                                    {footswitchFunctions.map((option, i) => <MenuItem key={`sw1func${i}`} value={i}>{option}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </span>
                        </div>
                        
                        <div>
                        <span>
                            <FormControl>
                                <Select
                                    autoWidth
                                    id="sw2"
                                    value={globalSettingsRes.switch2Function}
                                    onChange={(event) => updateSetting('switch2Function', event.target.value)}
                                    style={{ backgroundColor: 'gray', color: 'white', height: '2rem', width: '10rem', marginBottom: '10px', marginLeft: '10px' }}
                                    >
                                    {footswitchFunctions.map((option, i) => <MenuItem key={`sw2func${i}`} value={i}>{option}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </span>
                        </div>
                        
                        <div>
                        <span>
                            <FormControl>
                                <Select
                                    autoWidth
                                    id="sw3"
                                    value={globalSettingsRes.switch3Function}
                                    onChange={(event) => updateSetting('switch3Function', event.target.value)}
                                    style={{ backgroundColor: 'gray', color: 'white', height: '2rem', width: '10rem', marginBottom: '10px', marginLeft: '10px' }}
                                    >
                                    {footswitchFunctions.map((option, i) => <MenuItem key={`sw3func${i}`} value={i}>{option}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </span>
                        </div>
                        
                        <div>
                        <span>
                            <FormControl>
                                <Select
                                    autoWidth
                                    id="sw4"
                                    value={globalSettingsRes.switch4Function}
                                    onChange={(event) => updateSetting('switch4Function', event.target.value)}
                                    style={{ backgroundColor: 'gray', color: 'white', height: '2rem', width: '10rem', marginBottom: '10px', marginLeft: '10px' }}
                                    >
                                    {footswitchFunctions.map((option, i) => <MenuItem key={`sw4func${i}`} value={i}>{option}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </span>
                        </div>
                    </div>
                    </Grid>

                    <Grid item xs={3}>
                    <div style={{ backgroundColor: '#0f0e13', borderRadius: '3%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', paddingLeft: '5px', paddingRight: '5px' }}>
                        <div>
                        <h3>Display Control</h3>
                        <div>
                            <div>
                            <label htmlFor={"brightness"}>{`Brightness: ${globalSettingsRes.brightness}`}</label>
                            </div>
                        <Slider id="brightness" min={1} max={10} value={globalSettingsRes.brightness} onChange={(event, newValue: number | number[]) => updateSetting('brightness', typeof newValue === 'number' ? newValue : newValue[0])} />
                        </div>
                        
                        <div>
                            <div>
                            <label htmlFor={"contrast"}>{`Contrast: ${10 - globalSettingsRes.contrast}`}</label>
                            </div>
                        <Slider id="contrast" min={1} max={10} value={Math.abs(10 - globalSettingsRes.contrast)} onChange={(event, newValue: number | number[]) => updateSetting('contrast', typeof newValue === 'number' ? newValue : newValue[0])} />
                        </div>
                        </div>
                    <div>
                        <div>
                        <h3>Midi Clock</h3>
                        </div>
                        <div>
                            <TextField
                                id="midiClockMsb"
                                disabled={globalSettingsRes.midiClockState === 0}
                                variant='standard'
                                value={`${bpm > 0 ? bpm : ''}`}
                                onChange={handleBpmChange}
                                sx={{ backgroundColor: 'gray', color: 'white' }}
                                inputProps={{
                                    placeholder: '30 - 300',
                                    type: "number",
                                    max: 300
                                }}
                            />
                                <FormControlLabel
                                            control={
                                            <Switch
                                                checked={globalSettingsRes.midiClockState === 1}
                                                onChange={(event) => updateSetting('midiClockState', event.target.checked ? '1' : '0')}
                                                id="midiClockState"
                                                color="primary"
                                            />
                                            }
                                            label={globalSettingsRes.midiClockState ? "On" : "Off"}
                                            sx={{ marginLeft: '10px' }}
                                    />
                            {bpmError && <div style={{color: 'red'}}>{"Value must be between 30 and 300"}</div>}
                        </div>
                    </div>
                    </div>
                    </Grid>

                    <Grid item xs={3}>
                    <div style={{ backgroundColor: '#0f0e13', borderRadius: '3%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <div>
                        <h3>Midi Channel In</h3>
                            <FormControl>
                                <Select
                                    autoWidth
                                    id="midiInputChannel"
                                    value={globalSettingsRes.midiInputChannel}
                                    onChange={(event) => updateSetting('midiInputChannel', event.target.value)}
                                    style={{ backgroundColor: 'gray', color: 'white', height: '2rem', width: '10rem' }}
                                    >
                                    {midiInputChannelOptions.map((option, i) => <MenuItem key={`midiInOption${i+1}`} value={i}>{option}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </div>
                    <div>
                        <h3>Control Jack In</h3>
                        <Button variant={globalSettingsRes.controlJackMode === 1 ? 'contained' : 'outlined' }
                            onClick={() => updateSetting('controlJackMode', globalSettingsRes.controlJackMode === 0 ? '1' : '0')}
                        >{globalSettingsRes.controlJackMode === 0 ? 'Expression Pedal' : 'Three Button Switch'}</Button>
                    </div>
                    <div>
                        <h3>Utility Jack</h3>
                        <Button sx={{ width: '80%' }} variant={globalSettingsRes.utilityJackPolarity === 1 ? 'contained' : 'outlined' }
                            onClick={() => updateSetting('utilityJackPolarity', globalSettingsRes.utilityJackPolarity === 0 ? '1' : '0')}
                        >{globalSettingsRes.utilityJackPolarity === 1 ? 'Normally Open (NO)' : 'Normally Closed (NC)'}</Button>
                        <Button sx={{ marginTop: '0.5rem', width: '80%' }} variant={globalSettingsRes.utilityJackMode === 0 ? 'contained' : 'outlined' }
                            onClick={() => updateSetting('utilityJackMode', globalSettingsRes.utilityJackMode === 0 ? '1' : '0')}
                        >{globalSettingsRes.utilityJackMode === 0 ? 'Momentary' : 'Latching'}</Button>
                    </div>
                    </div>
                    </Grid>

                    <Grid item xs={3}>
                    <div style={{ backgroundColor: '#0f0e13', borderRadius: '3%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', marginRight: '5px' }}>
                        <div>
                        <h3>External Foot Switch Settings</h3>
                        <div>
                        <span>
                            <FormControl>
                                <Select
                                    autoWidth
                                    id="sw5"
                                    value={globalSettingsRes.switch5Function}
                                    onChange={(event) => updateSetting('switch5Function', event.target.value)}
                                    style={{ backgroundColor: 'gray', color: 'white', height: '2rem', width: '10rem', marginBottom: '10px', marginLeft: '10px' }}
                                    >
                                    {footswitchFunctions.map((option, i) => <MenuItem key={`sw5func${i}`} value={i}>{option}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </span>
                        </div>
                        
                        <div>
                        <span>
                            <FormControl>
                                <Select
                                    autoWidth
                                    id="sw6"
                                    value={globalSettingsRes.switch6Function}
                                    onChange={(event) => updateSetting('switch6Function', event.target.value)}
                                    style={{ backgroundColor: 'gray', color: 'white', height: '2rem', width: '10rem', marginBottom: '10px', marginLeft: '10px' }}
                                    >
                                    {footswitchFunctions.map((option, i) => <MenuItem key={`sw6func${i}`} value={i}>{option}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </span>
                        </div>
                        
                        <div>
                        <span>
                            <FormControl>
                                <Select
                                    autoWidth
                                    id="sw7"
                                    value={globalSettingsRes.switch7Function}
                                    onChange={(event) => updateSetting('switch7Function', event.target.value)}
                                    style={{ backgroundColor: 'gray', color: 'white', height: '2rem', width: '10rem', marginBottom: '10px', marginLeft: '10px' }}
                                    >
                                    {footswitchFunctions.map((option, i) => <MenuItem key={`sw7func${i}`} value={i}>{option}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </span>
                        </div>
                    </div>
                    <div style={{ paddingTop: '1rem' }}>
                        <Button onClick={handleUpdateModal} style={{ width: '80%' }} variant='outlined'>Update Firmware</Button>
                    </div>
                    </div> 
                    </Grid>
                    <Modal open={firmwareModalOpen}>
                        <Box sx={modalStyle}>
                        <h2>
                            Update Firmware
                        </h2>
                        <Divider />
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1rem' }}>
                            <Button variant='contained' onClick={handleUpdateFromFile} sx={{ width: '50%', mr: '5px' }}>Update from File</Button>
                            <Button variant='contained' onClick={handleUpdateFromWeb} sx={{ width: '50%' }}>Update from Web</Button>
                        </div>
                        <div id="modal-modal-description">
                            <p>{`Installed Firmware: ${installedFirmwareVersion}`}</p>
                            {showLocalUpdateVersion && (<p>{`Selected File Firmware: ${selectedLocalUpdateFile}`}</p>)} 
                            <input
                                id="fileInput"
                                type="file"
                                accept='.syx, .zip'
                                style={{ display: 'none' }}
                                onChange={handleFileChange}
                            />
                             {showUpdateDropdown && (<FormControl>
                                <span>Select Update Version:
                                <Select
                                    autoWidth
                                    id="cloud-files-dropdown"
                                    value={selectedCloudUpdateFile}
                                    onChange={handleSelectCloudFile}
                                    style={{ backgroundColor: 'gray', color: 'white', height: '2rem', marginBottom: '10px', marginLeft: '10px' }}
                                    >
                                    {updateDropdownOptions.map((option) => <MenuItem key={option.Key} value={option.Key}>{option.Key}</MenuItem>)}
                                </Select>
                                </span>
                        </FormControl>)}                                  
                        </div>
                        <Box sx={{ overflow: 'hidden' }}><div dangerouslySetInnerHTML={{ __html: markdownContent }}/></Box>
                        <LinearProgress variant='determinate' value={downloadProgress} sx={{ display: showProgressBar ? 'inherit' : 'none' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1rem' }}>
                            <Button variant='contained' onClick={closeModal} sx={{ width: '50%', mr: '5px' }}>Cancel</Button>
                            <Button variant='contained' disabled={!isFirmwareLoaded} onClick={handleUpdateFirmware} sx={{ width: '50%' }}>Update</Button>
                        </div>
                        </Box>
                    </Modal>
                </Grid>
            </div>
        </>} 
        </>
    )
}

export default GlobalSettings;