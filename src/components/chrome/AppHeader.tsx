// GLOBALS
import { useState } from 'react';
// COMPONENTS
import FormControl from '@mui/material/FormControl';
import HelpCenterOutlinedIcon from '@mui/icons-material/HelpCenterOutlined';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
// ASSETS/DATA
import logo  from '../../assets/logo.svg'
import '../../styles/AppHeader.css';


type AppHeaderProps = {
    status: string;
}

const AppHeader: React.FC<AppHeaderProps> = ({ status }: AppHeaderProps) => {
    const [selectedProduct, setSelectedProduct] = useState<string>("The Futurist");
    const [selectedTab, setSelectedTab] = useState<string>("Preset Organizer");

    const handleProductSelection = (event: SelectChangeEvent) => {
        setSelectedProduct(event.target.value as string);
    }

    const handleTabSelection = (event: any) => {
        setSelectedTab(event.target.value as string);
    }

    return(
        <div className="app-header">
            <FormControl>
                <Select
                    id="product-selection-dropdown"
                    value={selectedProduct}
                    onChange={handleProductSelection}
                    disabled
                >
                <MenuItem value="The Futurist">The Futurist</MenuItem>
                <MenuItem value="New Creation">New Creation</MenuItem>
              </Select>
            </FormControl>
            <div className='logo-container'>
                <img src={logo} className="App-logo" alt="logo" />
            </div>
            <div className='status-and-help'>
                <div className='status-container'>
                    <p>DEVICE</p>
                    <p style={{ color: status === 'connected' ? 'green' : 'red' }}>{status.toUpperCase()}</p>
                </div>
                <div className='help-container'>
                    <a href='https://www.matthewseffects.com/editor_manual/'><HelpCenterOutlinedIcon /></a>
                </div>
            </div>
            <div className='tab-container'>
            <Tabs value={selectedTab} onChange={handleTabSelection}>
                <Tab label='Preset Organizer' value={'Preset Organizer'}/>
                <Tab label='Preset Editor' value={'Preset Editor'}/>
                <Tab label='Smart Creators' value={'Smart Creators'}/>
                <Tab label='Global Settings' value={'Global Settings'}/>
            </Tabs>
            </div>
        </div>
    )
}

export default AppHeader;