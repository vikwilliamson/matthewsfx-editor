// GLOBALS
import { useState } from 'react';
// COMPONENTS
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import HelpCenterOutlinedIcon from '@mui/icons-material/HelpCenterOutlined';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
// ASSETS/DATA
import logo  from '../../assets/V2_SMOOTH_ME_LOGO_White.png'
import { EditorTab } from '../../types';


type AppHeaderProps = {
    currentTab: EditorTab;
    device: WebMidi.MIDIInput | null;
    setDevice: (event: SelectChangeEvent) => void;
    handleSelectTab: (tab: EditorTab) => void;
    midiDevices: WebMidi.MIDIInput[];
    status: string;
}

const AppHeader: React.FC<AppHeaderProps> = ({ currentTab, device, setDevice, handleSelectTab, midiDevices, status }: AppHeaderProps) => {
    const [selectedProduct, setSelectedProduct] = useState<string>("The Futurist");

    const handleProductSelection = (event: SelectChangeEvent) => {
        setSelectedProduct(event.target.value as string);
    }

    const handleTabSelection = (event: React.SyntheticEvent, newTab: EditorTab) => {
        handleSelectTab(newTab);
    }

    return(
        <>
            <div className="app-header" style={{ backgroundColor: '#222327', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                    <FormControl>
                        <Select
                            autoWidth
                            id="device-selection-dropdown"
                            value={device?.id || ''}
                            onChange={setDevice}
                            disabled={true}
                            style={{ backgroundColor: 'gray', color: 'white', opacity: '50%', minWidth: '10rem', marginLeft: '10px' }}
                        >
                        <MenuItem id="futurist" value="The Futurist">The Futurist</MenuItem>
                        <MenuItem id="newCreation" value="New Creation">New Creation</MenuItem>
                    </Select>
                    </FormControl>
                    <div style={{ flexGrow: 2, marginTop: '0.5rem' }} className='logo-container'>
                        <img src={logo} className="App-logo" alt="logo" width={200} height={100} />
                    </div>
                    <div className='status-container'>
                        <p>DEVICE</p>
                        <p style={{ color: status === 'connected' ? 'green' : 'red' }}>{status.toUpperCase()}</p>
                    </div>
                    <div className='help-container' style={{ marginLeft: '0.5rem', marginRight: '2rem' }}>
                        <a href='https://www.matthewseffects.com/editor_manual/' target='_blank' rel='noreferrer'><HelpCenterOutlinedIcon /></a>
                    </div>
                </div>
                <div className='tab-container' style={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                <Box sx={{ width: '100%', pb: 1, pl: 1, pr: 1 }}>
                <Tabs value={currentTab} onChange={handleTabSelection} textColor='inherit' variant='fullWidth'>
                    <Tab label={EditorTab.Organizer} value={EditorTab.Organizer} defaultChecked />
                    <Tab label={EditorTab.Editor} value={EditorTab.Editor}/>
                    <Tab label={EditorTab.Creators} value={EditorTab.Creators}/>
                    <Tab label={EditorTab.Settings} value={EditorTab.Settings}/>
                </Tabs>
                </Box>
            </div>
        </>
    )
}

export default AppHeader;