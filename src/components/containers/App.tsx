// GLOBALS
import React, { useEffect, useState } from 'react';
// COMPONENTS
import AppContent from './AppContent';
import AppHeader from '../chrome/AppHeader';
import LeftSideBar from '../chrome/LeftSideBar';

import Grid from '@mui/material/Grid';
// STYLES
import '../../styles/App.css';
// ASSETS/DATA

export type Bank = {
  bankName: string;
  presets: Preset[];
}

export type Preset = {
  presetName: string;
  presetDescription?: string;
  messages: Array<Array<string>>;
}

const App: React.FC = () => {
  const [midiAccessObject, setMidiAccessObject] = useState<WebMidi.MIDIAccess | null>(null);
  const [deviceStatus, setDeviceStatus] = useState<string>('disconnected');
  const [presets, setPresets] = useState<Bank[]>([{ bankName: 'Bank 1', presets: [{ presetName: 'TestPreset1', presetDescription: 'A sample test preset', messages: [['192', '0'], ['192', '1']] }, { presetName: 'TestPreset2', presetDescription: 'Sample text for a desc', messages: [['192', '1'], ['192', '0']] }]},
   { bankName: 'Bank 2', presets: [{ presetName: 'Test2Preset1', presetDescription: 'A description for the preset', messages: [['192', '1', '192', '0']] }] }]);

  useEffect(() => {
    const initMidi = async () => {
      try {
        const access = await navigator.requestMIDIAccess();
        setMidiAccessObject(access);
        setDeviceStatus('connected');
        
        // Listen for MIDI state changes
        access.onstatechange = (event) => {
          setDeviceStatus(event.port.state);
        };
      } catch (error) {
        setDeviceStatus('disconnected');
        console.error('Error initializing MIDI:', error);
      }
    };

    initMidi();
  }, []);

    return (
    <Grid className="App" container columns={16}>
    <Grid item xs={3}>
      <LeftSideBar banks={presets} />
    </Grid>
    <Grid item xs={13}>
      <AppHeader status={deviceStatus} />
      <AppContent />
    </Grid>
  </Grid>
  );
};

export default App;
