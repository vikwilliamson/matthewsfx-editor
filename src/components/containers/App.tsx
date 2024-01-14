// GLOBALS
import React, { useEffect, useState } from 'react';
// COMPONENTS
import AppHeader from '../chrome/AppHeader';
import LeftSideBar from '../chrome/LeftSideBar';
import AppContent from './AppContent';
// STYLES
import '../../styles/App.css';
import Grid from '@mui/material/Grid';
// ASSETS/DATA

const App: React.FC = () => {
  const [midiAccessObject, setMidiAccessObject] = useState<WebMidi.MIDIAccess | null>(null);
  const [deviceStatus, setDeviceStatus] = useState<string>('disconnected');

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
    <Grid item xs={2}>
      <LeftSideBar />
    </Grid>
    <Grid item xs={14}>
      <AppHeader status={deviceStatus} />
      <AppContent />
    </Grid>
  </Grid>
  );
};

export default App;
