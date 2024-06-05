// GLOBALS
import React, { useEffect, useRef, useState } from 'react';
import * as unzipper from 'unzipper';
// COMPONENTS
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import Modal from '@mui/material/Modal';
// DATA/UTILS
import { checkIfSysex } from '../../utilities/checkIfSysex';
import { FirmwareVersionResponse, GlobalSettingsResponse } from '../../types';
import { identifyOutput } from '../../utilities/identifyOutput';
import { commandBytes, messages } from '../../assets/dictionary';

type GlobalSettingsProps = {
    midiAccess: WebMidi.MIDIAccess | null;
    status: string;
}

interface MidiOutputRef {
  current: WebMidi.MIDIOutput | undefined;
}

const activeButtonStyle = {
    backgroundColor: 'gray',
    color: 'white',
    width: '100%'
}

const modalStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
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
    const [installedFirmwareVersion, setInstalledFirmwareVersion] = useState<string>('');
    const [fileFirmwareVersion, setFileFirmwareVersion] = useState<string>('Not Selected');
    const [isFirmwareLoaded, setIsFirmwareLoaded] = useState<boolean>(false);
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

    const handleUpdateFirmwareVersion = () => {
        if(output.current?.send) {
            output.current.send(messages.firmwareUpdateVersionRequest.messageData);
        }
        setFirmwareModalOpen(true);
    }

    const parseInstalledFirmwareVersion = (response: FirmwareVersionResponse) => {
        const { majorVersion1, majorVersion10, minorVersion1, minorVersion10 } = response;
        const version = `${majorVersion10 === 32 ? '': retrieveAsciiCharacter(majorVersion10)}${retrieveAsciiCharacter(majorVersion1)}.${retrieveAsciiCharacter(minorVersion10)}${minorVersion1 === 32 ? '': retrieveAsciiCharacter(minorVersion1)}`;
        setInstalledFirmwareVersion(version);
    }

    const handleUpdateFromFile = () => {
        alert('Update from File!!!');
    }

    const handleUpdateFromWeb = async () => {
        alert('Update from Web!!!');

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

        // Method 1 - No Unzip
        // const xhr = new XMLHttpRequest();
        // // Hard-coded for now, will write dynamic utility
        // const url = 's3://matthewseffects-futuristfirmware/Futurist-V03-03.zip';
    
        // xhr.open('GET', url, true);
        // xhr.responseType = 'blob';
    
        // xhr.onprogress = (event) => {
        //   if (event.lengthComputable) {
        //     const progress = (event.loaded / event.total) * 100;
        //     setDownloadProgress(progress);
        //   }
        // };
    
        // xhr.onload = () => {
        //   if (xhr.status === 200) {
        //     // File downloaded successfully
        //     const blob = xhr.response;
        //     // Do something with the downloaded file
        //   }
        // };
    
        // xhr.onerror = () => {
        //   console.error('Error downloading file');
        // };
    
        // xhr.send();
      };
    
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
            <div style={{ border: '1px solid white', padding: '5px' }}>
            <div>
                <Grid container spacing={2}>
                    <Grid item xs={3}>
                    <div>
                        <h3>Foot Switch Settings</h3>
                        <div>
                        <span style={{ width: '100%' }}>
                            <label htmlFor={"sw1"}>{"1"}</label>
                            <select id="sw1" value={globalSettingsRes.switch1Function} onChange={(event) => updateSetting('switch1Function', event.target.value)}>
                                {footswitchFunctions.map((option, i) => <option key={`sw1func${i}`} value={i}>{option}</option>)}
                            </select>
                        </span>
                        </div>
                        
                        <div>
                        <span>
                            <label htmlFor={"sw2"}>{"2"}</label>
                            <select id="sw2" value={globalSettingsRes.switch2Function} onChange={(event) => updateSetting('switch2Function', event.target.value)}>
                                {footswitchFunctions.map((option, i) => <option key={`sw2func${i}`} value={i}>{option}</option>)}
                            </select>
                        </span>
                        </div>
                        
                        <div>
                        <span>
                            <label htmlFor={"sw3"}>{"3"}</label>
                            <select id="sw3" value={globalSettingsRes.switch3Function} onChange={(event) => updateSetting('switch3Function', event.target.value)}>
                                {footswitchFunctions.map((option, i) => <option key={`sw3func${i}`} value={i}>{option}</option>)}
                            </select>
                        </span>
                        </div>
                        
                        <div>
                        <span>
                            <label htmlFor={"sw4"}>{"4"}</label>
                            <select id="sw4" value={globalSettingsRes.switch4Function} onChange={(event) => updateSetting('switch4Function', event.target.value)}>
                                {footswitchFunctions.map((option, i) => <option key={`sw4func${i}`} value={i}>{option}</option>)}
                            </select>
                        </span>
                        </div>
                    </div>
                    </Grid>

                    <Grid item xs={3}>
                    <div>
                        <h3>Display Control</h3>
                        <div>
                            <div>
                            <label htmlFor={"brightness"}>{`Brightness: ${globalSettingsRes.brightness}`}</label>
                            </div>
                        <input id="brightness" type='range' min={1} max={10} value={globalSettingsRes.brightness} onChange={(event) => updateSetting('brightness', event.target.value)} />
                        </div>
                        
                        <div>
                            <div>
                            <label htmlFor={"contrast"}>{`Contrast: ${10 - globalSettingsRes.contrast}`}</label>
                            </div>
                        <input id="contrast" type='range' min={1} max={10} value={Math.abs(10 - globalSettingsRes.contrast)} onChange={(event) => updateSetting('contrast', event.target.value)} />
                        </div>
                    </div>
                    <div>
                        <div>
                        <label htmlFor={"midiClockState"}>{"Midi Clock"}</label>
                        <input
                            id="midiClockState"
                            type="checkbox"
                            checked={globalSettingsRes.midiClockState === 1}
                            onChange={(event) => updateSetting('midiClockState', event.target.checked ? '1' : '0')}
                        />
                        </div>
                        <div>
                        <label htmlFor={"midiClockMsb"}>{"BPM "}</label>
                        <input
                            id="midiClockMsb"
                            disabled={globalSettingsRes.midiClockState === 0}
                            type="number"
                            value={`${bpm > 0 ? bpm : ''}`}
                            onChange={handleBpmChange}
                            placeholder='30 - 300'
                            max={300}
                            style={{ backgroundColor: 'white', color: 'black' }}
                        />
                        {bpmError && <div style={{color: 'red'}}>{"Value must be between 30 and 300"}</div>}
                        </div>
                    </div>
                    </Grid>

                    <Grid item xs={3}>
                    <div>
                        <span>
                            <label htmlFor={"midiInputChannel"}>{"Midi Channel In "}</label>
                            <select id="midiInputChannel" value={globalSettingsRes.midiInputChannel} onChange={(event) => updateSetting('midiInputChannel', event.target.value)}>
                                {midiInputChannelOptions.map((option, i) => <option key={`midiInOption${i+1}`} value={i}>{option}</option>)}
                            </select>
                        </span>
                    </div>
                    <div>
                        <h3>Control Jack In</h3>
                        <button style={globalSettingsRes.controlJackMode === 1 ? activeButtonStyle : { width: '100%' } }
                            onClick={() => updateSetting('controlJackMode', globalSettingsRes.controlJackMode === 0 ? '1' : '0')}
                        >{globalSettingsRes.controlJackMode === 0 ? 'Expression Pedal' : 'Three Button Switch'}</button>
                    </div>
                    <div>
                        <h3>Utility Jack</h3>
                         <button style={globalSettingsRes.utilityJackPolarity === 1 ? activeButtonStyle : { width: '100%' }}
                            onClick={() => updateSetting('utilityJackPolarity', globalSettingsRes.utilityJackPolarity === 0 ? '1' : '0')}
                        >{globalSettingsRes.utilityJackPolarity === 1 ? 'Normally Open (NO)' : 'Normally Closed (NC)'}</button>
                         <button style={globalSettingsRes.utilityJackMode === 0 ? activeButtonStyle : { width: '100%' }}
                            onClick={() => updateSetting('utilityJackMode', globalSettingsRes.utilityJackMode === 0 ? '1' : '0')}
                        >{globalSettingsRes.utilityJackMode === 0 ? 'Momentary' : 'Latching'}</button>
                    </div>
                    </Grid>

                    <Grid item xs={3}>
                    <div>
                        <h3>External Foot Switch Settings</h3>
                        <div>
                        <span>
                            <label htmlFor={"sw5"}>{"A"}</label>
                            <select id="sw5" disabled={globalSettingsRes.controlJackMode === 1} value={globalSettingsRes.switch5Function} onChange={(event) => updateSetting('switch5Function', event.target.value)}>
                                {footswitchFunctions.map((option, i) => <option key={`sw5func${i}`} value={i}>{option}</option>)}
                            </select>
                        </span>
                        </div>
                        
                        <div>
                        <span>
                            <label htmlFor={"sw6"}>{"B"}</label>
                            <select id="sw6" disabled={globalSettingsRes.controlJackMode === 1} value={globalSettingsRes.switch6Function} onChange={(event) => updateSetting('switch6Function', event.target.value)}>
                                {footswitchFunctions.map((option, i) => <option key={`sw6func${i}`} value={i}>{option}</option>)}
                            </select>
                        </span>
                        </div>
                        
                        <div>
                        <span>
                            <label htmlFor={"sw7"}>{"C"}</label>
                            <select id="sw7" disabled={globalSettingsRes.controlJackMode === 1} value={globalSettingsRes.switch7Function} onChange={(event) => updateSetting('switch7Function', event.target.value)}>
                                {footswitchFunctions.map((option, i) => <option key={`sw7func${i}`} value={i}>{option}</option>)}
                            </select>
                        </span>
                        </div>
                    </div>
                    <div style={{ paddingTop: '1rem' }}>
                        <button onClick={handleUpdateFirmwareVersion} style={{ width: '100%' }}>Update Firmware</button>
                    </div>
                    </Grid>
                    <Modal open={firmwareModalOpen}>
                        <Box sx={modalStyle}>
                        <h2>
                            Update Firmware
                        </h2>
                        <Divider />
                        <div style={{ paddingTop: '1rem' }}>
                            <button onClick={handleUpdateFromFile} style={{ width: '50%' }}>Update from File</button>
                            <button onClick={handleUpdateFromWeb} style={{ width: '50%' }}>Update from Web</button>
                        </div>
                        <div id="modal-modal-description">
                            <p>{`Installed Firmware: ${installedFirmwareVersion}`}</p>
                            <p>{`File Firmware: ${fileFirmwareVersion}`}</p>
                        </div>
                        <Box>Markdown</Box>
                        <LinearProgress variant='determinate' value={downloadProgress} />
                        <div style={{ paddingTop: '1rem' }}>
                            <button onClick={() => setFirmwareModalOpen(false)} style={{ width: '50%' }}>Cancel</button>
                            <button disabled={!isFirmwareLoaded} onClick={handleUpdateFromWeb} style={{ width: '50%' }}>Update</button>
                        </div>
                        </Box>
                    </Modal>
                </Grid>
            </div>
            </div>
        </>} 
        </>
    )
}

export default GlobalSettings;