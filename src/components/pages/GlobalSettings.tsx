// GLOBALS
import React, { useEffect, useRef, useState } from 'react';
// COMPONENTS
import Grid from '@mui/material/Grid';
// DATA/UTILS
import { checkIfSysex } from '../../utilities/checkIfSysex';
import { GlobalSettingsResponse } from '../../types';
import { identifyOutput } from '../../utilities/identifyOutput';
import { messages } from '../../assets/dictionary';

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
// TODO - make this an iterable type/enum and import it and use it that way instead
const footswitchFunctions = ['Activate Preset', 'Bank Up', 'Bank Down', 'Preset Up', 'Preset Down', 'Tap: Midi Clock', 'Tap: Utility + Midi Clock'];
const midiInputChannelOptions = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', 'Off'];

const GlobalSettings: React.FC<GlobalSettingsProps> = ({ midiAccess, status }) => {
    const globalSettingsInitialState = {
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
        controlJackMode: 0,
        midiClockState: 0,
        midiClockLsb: 0,
        midiClockMsb: 0,
        utilityJackPolarity: 0,
        utilityJackMode: 0,
        midiInputChannel: 0,
    };
    const [globalSettingsRes, setGlobalSettingsRes] = useState<GlobalSettingsResponse>(globalSettingsInitialState);

    let output: MidiOutputRef = useRef({} as WebMidi.MIDIOutput);

    const updateSetting = (setting: string, newValue: string | number) => {
        const valueAsNum = typeof newValue === 'string' ? parseInt(newValue) : newValue;
        const newSettings = { ...globalSettingsRes, [setting]: valueAsNum };

        setGlobalSettingsRes(newSettings);

        const messageToWrite = Object.values(newSettings);
        // TODO - decide if I want to do this or make the Start of Message and EOX part of the shape
        // First add Start of Message to beginning of array, then add EOX to end of array
        messageToWrite.unshift(0xf0);
        messageToWrite.push(0xf7);
        // Set command byte to "write"
        messageToWrite[6] = 0x22;

        // Validation for Midi Clock BPM
        if(setting === 'midiClockMsb') {
            if(valueAsNum <= 30 || valueAsNum >= 300) {
                // TODO - Create actual detailed error handling/validation around this
                return;
            }
        }

        // TODO
        // Additional logic for Switch Functions
        // If a switch is being used for Tap (Tap is enabled w/ value other than 127) then ignore function changes, unless
        // the function change is Tap-related (options w/ values 5 and 6)
        // if(setting.includes('switch')) {
        //     const switchNumber = parseInt(setting.substring(6, 7));

        //     if(valueAsNum === 5) {
        //         updateSetting('tapStatus', switchNumber);
        //         updateSetting('tapStatusMode', 1);
        //     }
        //     else if(valueAsNum === 6) {
        //         updateSetting('tapStatus', switchNumber);
        //         updateSetting('tapStatusMode', 0);
        //     }
        //     else {
        //         updateSetting('tapStatus', 127);
        //     }
        // }

        output.current?.send(messageToWrite);
    }

    useEffect(() => {
        const handleMidiMessage = (event: WebMidi.MIDIMessageEvent) => {
            if (checkIfSysex(event.data)) {
            // Parse response into the appropriate object
            const parsedResponse: GlobalSettingsResponse = {
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
    
            // Update state with parsed response object
            setGlobalSettingsRes(parsedResponse);
        }

          };

        if(midiAccess) {
            if(midiAccess.inputs.size > 0 && midiAccess.outputs.size > 0) {
            midiAccess?.inputs.forEach((input) => input.onmidimessage = handleMidiMessage);
            output.current = identifyOutput(midiAccess);
            }
            if(output.current?.send) {
                output.current.send(messages.globalSettings.messageData);
            }
        }
    }, [])

    return(
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
                        <label htmlFor={"brightness"}>{`Brightness: ${globalSettingsRes.brightness}`}</label>
                        <input id="brightness" type='range' min={0} max={10} value={globalSettingsRes.brightness} onChange={(event) => updateSetting('brightness', event.target.value)} />
                        </div>
                        
                        <div>
                            {/* TODO - Find more eloquent way to appropriately space this label */}
                            <div>
                            <label htmlFor={"contrast"}>{`Contrast: ${globalSettingsRes.contrast}`}</label>
                            </div>
                        <input id="contrast" type='range' min={0} max={10} value={globalSettingsRes.contrast} onChange={(event) => updateSetting('contrast', event.target.value)} />
                        </div>
                    </div>
                    <div>
                        <div>
                        <label htmlFor={"midiClockState"}>{"Midi Clock"}</label>
                        <input
                            id="midiClockState"
                            type="checkbox"
                            checked={globalSettingsRes.midiClockState === 0 ? false : true}
                            onChange={(event) => updateSetting('midiClockState', event.target.checked ? '1' : '0')}
                        />
                        </div>
                        <div>
                        <label htmlFor={"midiClockMsb"}>{"BPM "}</label>
                        <input
                            id="midiClockMsb"
                            disabled={globalSettingsRes.midiClockState === 0 ? true : false}
                            type="text"
                            value={globalSettingsRes.midiClockMsb}
                            onChange={(event) => updateSetting('midiClockMsb', event.target.value)}
                            placeholder='30 - 300'
                            min={30}
                            max={300}
                            style={{ backgroundColor: 'white', color: 'black' }}
                        />
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
                        {/* TODO: Refactor binary logic */}
                        <h3>Control Jack In</h3>
                        <button style={globalSettingsRes.controlJackMode === 1 ? activeButtonStyle : { width: '100%' } }
                            onClick={() => updateSetting('controlJackMode', globalSettingsRes.controlJackMode === 0 ? '1' : '0')}
                        >{globalSettingsRes.controlJackMode === 0 ? 'Expression Pedal' : 'Three Button Switch'}</button>
                    </div>
                    <div>
                        <h3>Utility Jack</h3>
                         <button style={globalSettingsRes.utilityJackPolarity === 1 ? activeButtonStyle : { width: '100%' }}
                            onClick={() => updateSetting('utilityJackPolarity', globalSettingsRes.utilityJackPolarity === 0 ? '1' : '0')}
                        >{globalSettingsRes.utilityJackPolarity === 0 ? 'Normally Closed (NC)' : 'Normally Open (NO)'}</button>
                         <button style={globalSettingsRes.utilityJackMode === 1 ? activeButtonStyle : { width: '100%' }}
                            onClick={() => updateSetting('utilityJackMode', globalSettingsRes.utilityJackMode === 0 ? '1' : '0')}
                        >{globalSettingsRes.utilityJackMode === 0 ? 'Momentary' : 'Latching'}</button>
                    </div>
                    </Grid>

                    <Grid item xs={3}>
                    <div>
                        <h3>External Foot Switch Settings</h3>
                        <div>
                        <span>
                            <label htmlFor={"sw5"}>{"5"}</label>
                            <select id="sw5" value={globalSettingsRes.switch5Function} onChange={(event) => updateSetting('switch5Function', event.target.value)}>
                                {footswitchFunctions.map((option, i) => <option key={`sw5func${i}`} value={i}>{option}</option>)}
                            </select>
                        </span>
                        </div>
                        
                        <div>
                        <span>
                            <label htmlFor={"sw6"}>{"6"}</label>
                            <select id="sw6" value={globalSettingsRes.switch6Function} onChange={(event) => updateSetting('switch6Function', event.target.value)}>
                                {footswitchFunctions.map((option, i) => <option key={`sw6func${i}`} value={i}>{option}</option>)}
                            </select>
                        </span>
                        </div>
                        
                        <div>
                        <span>
                            <label htmlFor={"sw7"}>{"7"}</label>
                            <select id="sw7" value={globalSettingsRes.switch7Function} onChange={(event) => updateSetting('switch7Function', event.target.value)}>
                                {footswitchFunctions.map((option, i) => <option key={`sw7func${i}`} value={i}>{option}</option>)}
                            </select>
                        </span>
                        </div>
                    </div>
                    <div style={{ paddingTop: '1rem' }}>
                        <button onClick={() => alert('Mock Updating Firmware...')} style={{ width: '100%' }}>Update Firmware</button>
                    </div>
                    </Grid>
                </Grid>
            </div>
            </div>
        </>} 
        </>
    )
}

export default GlobalSettings;