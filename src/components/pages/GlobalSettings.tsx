// GLOBALS
import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import JSZip from 'jszip';
// COMPONENTS
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import Modal from '@mui/material/Modal';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Slider from '@mui/material/Slider';
// DATA/UTILS
import { checkIfSysex } from '../../utilities/checkIfSysex';
import { FirmwareVersionResponse, GlobalSettingsResponse } from '../../types';
import { identifyOutput } from '../../utilities/identifyOutput';
import { commandBytes, messages } from '../../assets/dictionary';
import axios from 'axios';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';


type GlobalSettingsProps = {
    midiAccess: WebMidi.MIDIAccess | null;
    status: string;
}

interface MidiOutputRef {
  current: WebMidi.MIDIOutput | undefined;
}

const modalStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 'fit-content',
    bgcolor: '#313239',
    border: '2px solid #000',
    color: 'white',
    boxShadow: 24,
    p: 4,
  };

// TODO - make this an iterable type/enum and import it and use it that way instead
const footswitchFunctions = ['Activate Preset', 'Bank Up', 'Bank Down', 'Preset Up', 'Preset Down', 'Tap: Midi Clock', 'Tap: Utility + Midi Clock'];
const midiInputChannelOptions = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', 'Off'];

const GlobalSettings: React.FC<GlobalSettingsProps> = ({ midiAccess, status }) => {
    const globalSettingsInitialState: GlobalSettingsResponse = {
        mfxId1: 0,
        mfxId2: 0,
        mfxId3: 0,
        productIdLsb: 0,
        productIdMsb: 0,
        commandByte: 0,
        tapStatus: 127,
        tapStatusMode: 0,
        switch1Function: 0,
        switch2Function: 0,
        switch3Function: 0,
        switch4Function: 0,
        switch5Function: 0,
        switch6Function: 0,
        switch7Function: 0,
        contrast: 0,
        brightness: 0,
        controlJackMode: 1,
        midiClockState: 0,
        midiClockLsb: 0,
        midiClockMsb: 0,
        utilityJackPolarity: 0,
        utilityJackMode: 1,
        midiInputChannel: 0,
    };

    const firmwareVersionInitialState: FirmwareVersionResponse = {
        mfxId1: 0,
        mfxId2: 0,
        mfxId3: 0,
        productIdLsb: 0,
        productIdMsb: 0,
        commandByte: 0,
        majorVersion10: 0,
        majorVersion1: 0,
        minorVersion10: 0,
        minorVersion1: 0
    };

    const footswitchDropdownValuesInitialState = {
        switch1Function: footswitchFunctions[0],
        switch2Function: footswitchFunctions[0],
        switch3Function: footswitchFunctions[0],
        switch4Function: footswitchFunctions[0],
        switch5Function: footswitchFunctions[0],
        switch6Function: footswitchFunctions[0],
        switch7Function: footswitchFunctions[0],
    }

    const [globalSettingsRes, setGlobalSettingsRes] = useState<GlobalSettingsResponse>(globalSettingsInitialState);
    const [firmwareVersionRes, setFirmwareVersionRes] = useState<FirmwareVersionResponse | {}>(firmwareVersionInitialState);
    const [bpm, setBpm] = useState<number>(0);
    const [bpmError, setBpmError] = useState<boolean>(false);
    const [footswitchDropdownValues, setFootswitchDropdownValues] = useState<object>(footswitchDropdownValuesInitialState);
    const [firmwareModalOpen, setFirmwareModalOpen] = useState<boolean>(false);
    const [markdownContent, setMarkdownContent] = useState<string>(`# Firmware Update
    **Directions**
    - Select "Update From File" to select a specific local update file **OR**
    - Select "Update From The Web" to update to the latest version
    - The release notes will appear here
    - To update, press the "Update" button
    -  To quit, press the "Cancel" button
    ---
    *If no release notes are displayed, no release notes were found for this release.*`);
    const [installedFirmwareVersion, setInstalledFirmwareVersion] = useState<string>('');
    const [isFirmwareLoaded, setIsFirmwareLoaded] = useState<boolean>(false);
    const [selectedUpdateFile, setSelectedUpdateFile] = useState<File | null>(null);
    const [downloadProgress, setDownloadProgress] = useState<number>(0);

    let output: MidiOutputRef = useRef({} as WebMidi.MIDIOutput);

    const debounce = (func: Function, delay: number) => {
        let timeoutId: NodeJS.Timeout;
        return (...args: any[]) => {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            func(...args);
          }, delay);
        };
      };

    const calculateMidiClockValues = (tempo: number) => {
        const midiClockMSB = Math.floor(tempo / 128);
        const midiClockLSB = tempo % 128;

        return { LSB: midiClockLSB, MSB: midiClockMSB };
    };

    const retrieveAsciiCharacter = (value: number) => {
        try {   
          // Check if the value is within the valid ASCII range (32 to 126)
          if (value < 32 || value > 126) {
            throw new Error('Invalid ASCII value');
          }
          
          // Convert integer to ASCII character
          const charCode = parseInt(String(value), 10);
          const asciiChar = String.fromCharCode(charCode);
          
          return asciiChar;
        } catch (error) {
          console.error('Error converting hexadecimal to ASCII:', error);
        }
      };

    const validateBpm = (value: string) => {
        const valueAsNum = parseInt(value);
        // Validation for Midi Clock BPM
        if(valueAsNum < 30 && valueAsNum !== 0) {
            // TODO - Create detailed error handling around this
            setBpmError(true);
            updateSetting('midiClockMsb', 30);
        }
        else if(valueAsNum >= 300) {
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

    const fetchMarkdown = async (path?: string) => {
        const pathToMarkdown = path ?? '../../../public/markdown/firmwareUpdateInstructions.txt';

        try {
          const response = await fetch('../../../public/markdown/firmwareUpdateInstructions.txt');
          console.log('Response from Markdown Fetch: ', response)
          const text = await response.text();
          console.log('Markdown Text: ', text)
        //   setMarkdownContent(text);
        } catch (error) {
          console.error('Error fetching markdown file:', error);
        }
    };

    const formatFilename = (name: string) => {
       return name.replace('Futurist-V', '').replace('.syx', '').replace('-', '.');
    }

    const handleUpdateFirmwareVersion = () => {
        if(output.current?.send) {
            output.current.send(messages.firmwareUpdateVersionRequest.messageData);
        }

        fetchMarkdown();
        setFirmwareModalOpen(true);
    }

    const parseInstalledFirmwareVersion = (response: FirmwareVersionResponse) => {
        const { majorVersion1, majorVersion10, minorVersion1, minorVersion10 } = response;
        const version = `${majorVersion10 === 32 ? '': retrieveAsciiCharacter(majorVersion10)}${retrieveAsciiCharacter(majorVersion1)}.${retrieveAsciiCharacter(minorVersion10)}${minorVersion1 === 32 ? '': retrieveAsciiCharacter(minorVersion1)}`;
        setInstalledFirmwareVersion(version);
    }

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
          setSelectedUpdateFile(file);
          setIsFirmwareLoaded(true);
        }
    };

    const handleUpdateFromFile = () => {
        // 1. Open file explorer
        document.getElementById('fileInput')?.click();
        // 2. Allow user to select update file
        // 3. Once selected, store update data in state as if being done via Web
    }

    const handleUpdateFromWeb = async () => {
        // 1. Request compressed update folder from AWS bucket
        // 2. Unzip folder
        // 3. Store markdown in state
        // 4. Store download data in state

        try {
            // const awsResponse = await axios.get('s3://matthewseffects-futuristfirmware/Futurist-V03-03.zip');
            const awsResponse = await axios.get('https://matthewseffects-futuristfirmware.s3.us-west-2.amazonaws.com/Futurist-V03-02.zip', { withCredentials: false });
            console.log('Response Type: ', typeof awsResponse.data);
        }
        catch (error) {
            console.error(error);
        }

        // Method 2 - With Unzip
        // try {
        //     const response = await fetch('s3://matthewseffects-futuristfirmware/Futurist-V03-03.zip');
        //     const reader = response.body?.getReader();
      
        //     if (!reader) {
        //       throw new Error('Failed to get reader from response body');
        //     }
      
        //     const totalLength = Number(response.headers.get('Content-Length'));
        //     let downloadedLength = 0;
      
        //     const unzipStream = unzipper.Parse();
      
        //     unzipStream.on('entry', (entry) => {
        //       // Handle each entry in the zip file
        //       // Here you can extract files or do whatever you need with them
        //       // For example, you can extract text files and set the content in state
        //       entry.on('data', (data: Buffer) => {
        //         // Handle entry data
        //       });
      
        //       entry.on('end', () => {
        //         // Entry processing complete
        //       });
      
        //       entry.autodrain();
        //     });
      
        //     const stream = response.body?.pipe(unzipStream);
      
        //     if (!stream) {
        //       throw new Error('Failed to create unzip stream');
        //     }
      
        //     stream.on('data', (chunk) => {
        //       // Update download progress
        //       downloadedLength += chunk.length;
        //       const progress = (downloadedLength / totalLength) * 100;
        //       setDownloadProgress(progress);
        //     });
      
        //     stream.on('end', () => {
        //       // All data has been read
        //       console.log('Unzipping complete');
        //     });
        //   } catch (error) {
        //     console.error('Error downloading or unzipping file:', error);
        //   }

        // const xhr = new XMLHttpRequest();
        // const url = 's3://matthewseffects-futuristfirmware/Futurist-V03-03.zip';

        // xhr.open('GET', url, true);
        // xhr.responseType = 'blob';

        // xhr.onprogress = (event) => {
        // if (event.lengthComputable) {
        //     const progress = (event.loaded / event.total) * 100;
        //     setDownloadProgress(progress);
        // }
        // };

        // xhr.onload = async () => {
        // if (xhr.status === 200) {
        //     const blob = xhr.response;
        //     const zip = new JSZip();
        //     const zipContent = await zip.loadAsync(blob);

        //     // Log the filenames
        //     zipContent.forEach((relativePath, file) => {
        //     console.log('File:', relativePath);
        //     });
        // }
        // };

        // xhr.onerror = () => {
        // console.error('Error downloading file');
        // };

        // xhr.send();
        // setIsFirmwareLoaded(true);
      };

    const handleUpdateFirmware = () => {
        // Send midi message to device with firmware data from state
        let messagesToSend: number[][] = [];
        let tempArray: number[] = [240];
        const reader = selectedUpdateFile?.stream().getReader();

        const push = () => {
            // "done" is a Boolean and value a "Uint8Array"
            if(reader) {
            reader.read().then(({ done, value }) => {
              // If there is no more data to read
              if (done) {
                console.log("done", done);
                // Iterate over messagesToSend and send each one
                if(output.current?.send) {
                    messagesToSend.forEach((message, i) => {
                        // console.log('Mess to send: ', message)
                        // output.current?.send(message);
                    setTimeout(() => {
                        console.log('Mess to send: ', message);
                        output.current?.send(message);
                      }, i * 50); // 500ms delay for each subsequent array
                    });
                }
                    
                return;
              }
              
              console.log(done, value);
              value.forEach(byte => {
                // Separate each sysex message for the series sent as firmware update by checking for Start of Message byte
                if (byte === 240) {
                    if (tempArray.length > 1) {
                      // TODO: Extract midi message sending logic into utility
                      // Send messageToSend
                      messagesToSend.push(tempArray);
                      tempArray = [240];
                    }
                  } else {
                    tempArray.push(byte);
                  }
                });
            
                if (tempArray.length > 1) {
                    messagesToSend.push(tempArray);
                }
              
              push();
            });
           }
          }
  
          push();
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
            output.current?.send(messageToWrite);
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
                  mfxId1: event.data[1],
                  mfxId2: event.data[2],
                  mfxId3: event.data[3],
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
                mfxId1: event.data[1],
                mfxId2: event.data[2],
                mfxId3: event.data[3],
                productIdMsb: event.data[4],
                productIdLsb: event.data[5],
                commandByte: event.data[6],
                majorVersion10: event.data[7],
                majorVersion1: event.data[8],
                minorVersion10: event.data[9],
                minorVersion1: event.data[10]
                };
                setFirmwareVersionRes(fvResponse);
                parseInstalledFirmwareVersion(fvResponse);
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

    useEffect(() => {
        // Retrieve Global Settings on page load
        if(output.current?.send) {
            output.current.send(messages.globalSettingsRequest.messageData);
        }
    }, [])

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
                            {/* <label htmlFor={"sw1"}>{"1"}</label> */}
                            <FormControl>
                                {/* <InputLabel id="sw1-label" style={{ color: 'white' }}>Function 1</InputLabel> */}
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
                            {/* <label htmlFor={"sw2"}>{"2"}</label> */}
                            <FormControl>
                                {/* <InputLabel id="sw2-label" style={{ color: 'white' }}>Function 2</InputLabel> */}
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
                            {/* <label htmlFor={"sw3"}>{"3"}</label> */}
                            <FormControl>
                                {/* <InputLabel id="sw3-label" style={{ color: 'white' }}>Function 3</InputLabel> */}
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
                            {/* <label htmlFor={"sw4"}>{"4"}</label> */}
                            <FormControl>
                                {/* <InputLabel id="sw4-label" style={{ color: 'white' }}>Function 4</InputLabel> */}
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
                        <Button onClick={handleUpdateFirmwareVersion} style={{ width: '80%' }} variant='outlined'>Update Firmware</Button>
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
                            <p>{`File Firmware: ${selectedUpdateFile?.name ? formatFilename(selectedUpdateFile.name) : 'Not Selected'}`}</p>
                            <input
                                id="fileInput"
                                type="file"
                                accept='.syx'
                                style={{ display: 'none' }}
                                onChange={handleFileChange}
                            />
                        </div>
                        <Box><ReactMarkdown children={markdownContent}></ReactMarkdown></Box>
                        <LinearProgress variant='determinate' value={downloadProgress} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1rem' }}>
                            <Button variant='contained' onClick={() => setFirmwareModalOpen(false)} sx={{ width: '50%', mr: '5px' }}>Cancel</Button>
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