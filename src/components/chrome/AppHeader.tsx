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
import logo  from '../../assets/MFXLogo.svg'
import '../../styles/AppHeader.css';
import { EditorTab, SetStateAction } from '../../types';


type AppHeaderProps = {
    currentTab: EditorTab;
    device: WebMidi.MIDIInput | null;
    setDevice: (event: SelectChangeEvent) => void;
    handleSelectTab: SetStateAction<EditorTab>;
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
            <div className="app-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                    <FormControl>
                            <Select
                                autoWidth
                                id="product-selection-dropdown"
                                value={selectedProduct}
                                onChange={handleProductSelection}
                                style={{ backgroundColor: 'gray', color: 'white', opacity: '50%', minWidth: '10rem', marginLeft: '10px' }}
                                disabled
                            >
                            <MenuItem id="futurist" value="The Futurist">The Futurist</MenuItem>
                            <MenuItem id="newCreation" value="New Creation">New Creation</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl>
                        <Select
                            autoWidth
                            id="device-selection-dropdown"
                            value={device?.id || ''}
                            onChange={setDevice}
                            style={{ backgroundColor: 'gray', color: 'white', opacity: '50%', minWidth: '10rem', marginLeft: '10px' }}
                        >
                            {midiDevices.map((device) => (
                                <MenuItem key={device.id} value={device.id}>
                                    {device.name}
                                </MenuItem>
                            ))}
                        </Select>
                </Box>
                    
                    <div className='logo-container'>
                        <img src={logo} className="App-logo" alt="logo" width={150} height={150} />
                    </div>
                    <div className='status-container'>
                        <p>DEVICE</p>
                        <p style={{ color: status === 'connected' ? 'green' : 'red' }}>{status.toUpperCase()}</p>
                    </div>
                    <div className='help-container' style={{ marginRight: '2rem' }}>
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