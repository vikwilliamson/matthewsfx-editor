// GLOBALS
import React, { useEffect, useState } from 'react';
// COMPONENTS
import AppContent from './AppContent';
import AppHeader from '../chrome/AppHeader';
import LeftSideBar from '../chrome/LeftSideBar';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Modal from '@mui/material/Modal';
// STYLES
import '../../styles/App.css';
// ASSETS/DATA
import { Bank, EditorTab } from '../../types';
import { commandBytes } from '../../assets/dictionary';
// UTILS
import { checkIfSysex } from '../../utilities/checkIfSysex';

const App: React.FC = () => {
  const [compatibilityModalOpen, setCompatibilityModalOpen] = useState<boolean>(false);
  const [deviceStatus, setDeviceStatus] = useState<string>('disconnected');
  const [midiAccessObject, setMidiAccessObject] = useState<WebMidi.MIDIAccess | null>(null);
  const [selectedTab, setSelectedTab] = useState<EditorTab>(EditorTab.Organizer);

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
  const [presets, setPresets] = useState<Bank[]>([{ bankName: 'Bank 1', presets: [{ presetName: 'TestPreset1', presetDescription: 'A sample test preset', messages: [['192', '0'], ['192', '1']] }, { presetName: 'TestPreset2', presetDescription: 'Sample text for a desc', messages: [['192', '1'], ['192', '0']] }]},
   { bankName: 'Bank 2', presets: [{ presetName: 'Test2Preset1', presetDescription: 'A description for the preset', messages: [['192', '1', '192', '0']] }] }]);

  const handleMidiMessage = (event: WebMidi.MIDIMessageEvent) => {
    // TODO: Write function for parsing based on the response that was sent
    if (checkIfSysex(event.data)) {
      // Parse response into the appropriate object
      const commandFromResponse = event.data[6];
      //@ts-ignore
      const responseType = Object.keys(commandBytes).find(key => commandBytes[key] === commandFromResponse);
      let parsedResponse = {};

      switch(responseType) {
        case 'globalSettingsResponse': 
          parsedResponse = {
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
      break;
      case 'firmwareVersionResponse':
        parsedResponse = {
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
      break;
      default:
      }
    }
  }

  useEffect(() => {
    const initMidi = async () => {
      // Check if this browser is compatible first
      if(navigator.requestMIDIAccess) {
        try {
          const access = await navigator.requestMIDIAccess({ sysex: true });
          setMidiAccessObject(access);
          // Check for available MIDI devices on initial load
          const devices = access.inputs.values();

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
          setDeviceStatus('disconnected');
          console.error('Error initializing MIDI:', error);
        }
      }
      else {
        setCompatibilityModalOpen(true);
      }
    };

    initMidi();
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
    <Grid item xs={3}>
      <LeftSideBar userBanks={presets} />
    </Grid>
    <Grid item xs={13}>
      <AppHeader status={deviceStatus} currentTab={selectedTab} handleSelectTab={setSelectedTab} />
      <AppContent currentTab={selectedTab} status={deviceStatus} midiAccess={midiAccessObject} />
    </Grid>
  </Grid>
  );
};

export default App;
