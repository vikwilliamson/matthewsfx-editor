// GLOBALS
import React, { useEffect, useState } from 'react';
// COMPONENTS
import AppContent from './AppContent';
import AppHeader from '../chrome/AppHeader';
import LeftSideBar from '../chrome/LeftSideBar';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Modal from '@mui/material/Modal';
import { SelectChangeEvent } from '@mui/material/Select';
// STYLES
import '../../styles/App.css';
// ASSETS/DATA
import { Bank, EditorTab, FirmwareVersionResponse, GlobalSettingsResponse } from '../../types';
import { identifyOutput } from '../../utilities/identifyOutput';
import { checkIfSysex } from '../../utilities/checkIfSysex';
import { commandBytes, messages } from '../../assets/dictionary';

const globalSettingsInitialState: GlobalSettingsResponse = {
  mfxId1: 0x00,
  mfxId2: 0x02,
  mfxId3: 0x30,
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

const App: React.FC = () => {
  const [compatibilityModalOpen, setCompatibilityModalOpen] = useState<boolean>(false);
  const [deviceStatus, setDeviceStatus] = useState<string>('disconnected');
  const [midiAccessObject, setMidiAccessObject] = useState<WebMidi.MIDIAccess | null>(null);
  const [midiDevices, setMidiDevices] = useState<WebMidi.MIDIInput[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<WebMidi.MIDIInput>({} as WebMidi.MIDIInput);
  const [deviceGlobalSettings, setDeviceGlobalSettings] = useState<GlobalSettingsResponse>(globalSettingsInitialState);
  const [selectedTab, setSelectedTab] = useState<EditorTab>(EditorTab.Organizer);
  const [presets, setPresets] = useState<Bank[]>([{ bankName: 'Bank 1', presets: [{ presetName: 'TestPreset1', presetDescription: 'A sample test preset', messages: [['192', '0'], ['192', '1']] }, { presetName: 'TestPreset2', presetDescription: 'Sample text for a desc', messages: [['192', '1'], ['192', '0']] }]},
   { bankName: 'Bank 2', presets: [{ presetName: 'Test2Preset1', presetDescription: 'A description for the preset', messages: [['192', '1', '192', '0']] }] }]);

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

  const updateMidiDevices = (midiAccess: WebMidi.MIDIAccess) => {
    const inputs = midiAccess.inputs.values();
    const foundDevices: WebMidi.MIDIInput[] = [];
    for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
      foundDevices.push(input.value);
    }
    setMidiDevices(foundDevices);
    const defaultDevice = midiDevices.find((device) => device.name === "The Futurist");
    if(defaultDevice) {
      setSelectedDevice(defaultDevice);
      setDeviceStatus('connected');
    }
    else if(foundDevices[0]) {
      setSelectedDevice(foundDevices[0]);
      setDeviceStatus('connected');
    }
    else {
      setDeviceStatus('disconnected');
    }
  };

  const handleDeviceSelection = (event: SelectChangeEvent) => {
    const deviceId = event.target.value;
    const selectedDevice = midiDevices.find((device) => device.id === deviceId);
    if(selectedDevice) {
      setSelectedDevice(selectedDevice);
      setDeviceStatus('connected');
    }
    else {
      setDeviceStatus('disconnected');
    }
  };

  const requestGlobalSettings = async () => {
    const outputToUse = identifyOutput(midiAccessObject);
    await outputToUse?.open();
    console.log('Request Global Settings output: ', outputToUse)
    const devices = midiAccessObject?.inputs.values();
    console.log('Devices: ', devices)
    outputToUse?.send(messages.globalSettingsRequest.messageData);
  }

  const handleSelectTab = (tab: EditorTab) => {
    if(tab === EditorTab.Settings) {
      console.log('Making Global Settings request!');
      requestGlobalSettings();
    }

    setSelectedTab(tab);
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
            // TODO: Create constants for the mfx ids and import them into this file
            mfxId1: 0x00,
            mfxId2: 0x02,
            mfxId3: 0x30,
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
          console.log('Device Settings Response: ', gSResponse);
          setDeviceGlobalSettings(gSResponse);
          break;
        case 'firmwareVersionResponse':
          // const fvResponse: FirmwareVersionResponse = {
          // mfxId1: 0x00,
          // mfxId2: 0x02,
          // mfxId3: 0x30,
          // productIdMsb: event.data[4],
          // productIdLsb: event.data[5],
          // commandByte: event.data[6],
          // majorVersion10: event.data[7],
          // majorVersion1: event.data[8],
          // minorVersion10: event.data[9],
          // minorVersion1: event.data[10]
          // };
          // parseInstalledFirmwareVersion(fvResponse);
          break;
      default:
        }
      }
    }
    
    const initMidi = async () => {
      // Check if this browser is compatible first
      if(navigator.requestMIDIAccess) {
        try {
          const access = await navigator.requestMIDIAccess({ sysex: true });
          setMidiAccessObject(access);
          
          // Check for available MIDI devices on initial load
          const devices = access.inputs.values();
          access.inputs.forEach((input) => input.onmidimessage = handleMidiMessage);

          for (const input of devices) {
            if(input.name === 'The Futurist') {
              setDeviceStatus('connected');
              // input.onmidimessage = handleMidiMessage;
            }
            break;
          }
          
          // Listen for MIDI state changes
          access.onstatechange = (event) => {
            setDeviceStatus(event.port.state);
          };

        } catch (error) {
          console.error('Error initializing MIDI:', error);
        }
      }
      else {
        setCompatibilityModalOpen(true);
      }
    };

    initMidi();
    requestGlobalSettings();
  }, []);

    return (
    <Grid className="App" container columns={16}>
      <Modal open={compatibilityModalOpen}>
        <Box sx={modalStyle}>
          <h2>
            Browser Incompatible
          </h2>
          <p id="modal-modal-description">
            Please use a modern browser to enjoy this tool.
          </p>
        </Box>
      </Modal>
    <Grid item xs={2}>
      <LeftSideBar userBanks={presets} />
    </Grid>
    <Grid item xs={14}>
      <AppHeader midiDevices={midiDevices} device={selectedDevice} setDevice={handleDeviceSelection} status={deviceStatus} currentTab={selectedTab} handleSelectTab={handleSelectTab} />
      <AppContent currentTab={selectedTab} deviceSettings={deviceGlobalSettings} status={deviceStatus} midiAccess={midiAccessObject} />
    </Grid>
  </Grid>
  );
};

export default App;
