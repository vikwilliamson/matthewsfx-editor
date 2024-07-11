import { useState } from "react";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";

const PresetEditor: React.FC = () => {
    let bankOptions = new Array(30).fill('').map((option, i) => `Bank ${i+1}`);
    let presetOptions = new Array(7).fill('').map((option, i) => `Preset ${i+1}`);
    const expressionChannelOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
    // TODO: Refactor below into enum
    const utilityModeOptions = ['Tap', 'Switch: tip', 'Switch: ring', 'Switch: both'];

    const [selectedBank, setSelectedBank] = useState<string>('0');
    const [selectedPreset, setSelectedPreset] = useState<string>('0');
    const [selectedPresetName, setSelectedPresetName] = useState<string>('');
    const [selectedPresetDescription, setSelectedPresetDescription] = useState<string>('');

    const [expressionStatus, setExpressionStatus] = useState<boolean>(false);
    const [expressionChannel, setExpressionChannel] = useState<string | number>(0);
    const [expressionCC, setExpressionCC] = useState<string>('');

    const [utilityStatus, setUtilityStatus] = useState<boolean>(false);
    const [utilityMode, setUtilityMode] = useState<string>('0');
    const [utilityBPM, setUtilityBPM] = useState<string>('');

    const [midiClockStatus, setMidiClockStatus] = useState<boolean>(false);
    // TODO: Refactor below actions into an enum
    const [midiOnPressAction, setMidiOnPressAction] = useState<boolean>(true);
    const [midiBPM, setMidiBPM] = useState<string>('');

    const [currentPresetMessage, setCurrentPresetMessage] = useState<number>(1);

    return(
        <>
            <h1>Preset Editor</h1>
            <Box sx={{ backgroundColor: '#0f0e13', borderRadius: '3%', display: 'flex', flexDirection: 'column', height: '55vh', marginLeft: '5px', marginRight: '5px', paddingTop: '10px' }}>
                <Box sx={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
                <FormControl>
                    {/* <InputLabel id="bank-select-label" style={{ color: 'white' }}>Bank Select</InputLabel> */}
                    <Select
                        autoWidth
                        id="bank-select"
                        value={selectedBank}
                        onChange={(event) => setSelectedBank(event.target.value)}
                        placeholder="Bank Select"
                        style={{ backgroundColor: 'gray', color: 'white', height: '2rem', width: '10rem', marginBottom: '10px', marginLeft: '10px' }}
                        >
                        {bankOptions.map((option, i) => <MenuItem key={`bankOption${i}`} value={i}>{option}</MenuItem>)}
                    </Select>
                </FormControl>
                <FormControl>
                    {/* <InputLabel id="preset-select-label" style={{ color: 'white' }}>Preset Select</InputLabel> */}
                    <Select
                        autoWidth
                        id="preset-select"
                        value={selectedPreset}
                        onChange={(event) => setSelectedPreset(event.target.value)}
                        style={{ backgroundColor: 'gray', color: 'white', height: '2rem', width: '10rem', marginBottom: '10px', marginLeft: '10px' }}
                        >
                        {presetOptions.map((option, i) => <MenuItem key={`presetOption${i}`} value={i}>{option}</MenuItem>)}
                    </Select>
                </FormControl>
                <TextField
                    id="preset-name"
                    variant='standard'
                    value={selectedPresetName}
                    placeholder="Preset Name"
                    onChange={(event) => setSelectedPresetName(event.target.value)}
                    sx={{ backgroundColor: 'gray', color: 'white', marginLeft: '10px' }}
                />
                <Button variant='contained' onClick={() => alert('Audition!')} sx={{ marginLeft: '10px', width: '20%', height: '31px' }}>Audition</Button>
                </Box>
                <Box>
                    <TextField
                        id="preset-description"
                        variant='standard'
                        value={selectedPresetDescription}
                        placeholder="Description of the preset"
                        onChange={(event) => setSelectedPresetDescription(event.target.value)}
                        sx={{ backgroundColor: 'gray', color: 'white', width: '80%' }}
                    />
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                    <Box id='preset-messages' sx={{ width: '70%' }}>
                        {/* TODO: Refactor to use .map() */}
                        <Tabs value={currentPresetMessage} onChange={(event, value) => setCurrentPresetMessage(value)} textColor='inherit' variant='scrollable'>
                            <Tab label={1} value={1} defaultChecked />
                            <Tab label={2} value={2} />
                            <Tab label={3} value={3} />
                            <Tab label={4} value={4} />
                            <Tab label={5} value={5} />
                            <Tab label={6} value={6} />
                            <Tab label={7} value={7} />
                            <Tab label={8} value={8} />
                            <Tab label={9} value={9} />
                            <Tab label={10} value={10} />
                            <Tab label={11} value={11} />
                            <Tab label={12} value={12} />
                            <Tab label={13} value={13} />
                            <Tab label={14} value={14} />
                            <Tab label={15} value={15} />
                            <Tab label={16} value={16} />
                        </Tabs>
                        <Box>
                            <Button variant='outlined' onClick={() => alert('Manual Creation!')} sx={{ marginLeft: '10px' }}>Manual</Button>
                            <Button variant='outlined' onClick={() => alert('Smart Creation!')} sx={{ marginLeft: '10px' }}>Smart</Button>
                            <Button variant='outlined' onClick={() => alert('Custom Creation!')} sx={{ marginLeft: '10px' }}>Custom</Button>
                            <p color='white'>Select to create a message.</p>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', textAlign: 'left', marginRight: '10px' }}>
                                <span>Exp
                                    <FormControlLabel
                                            control={
                                            <Switch
                                                checked={expressionStatus}
                                                onChange={() => setExpressionStatus(!expressionStatus)}
                                                name="expression-status"
                                                color="primary"
                                            />
                                            }
                                            label={expressionStatus ? "On" : "Off"}
                                            sx={{ marginLeft: '10px' }}
                                    />
                                </span>
                                <span>Channel 
                                    <FormControl>
                                        <Select
                                            autoWidth
                                            disabled={!expressionStatus}
                                            id="exp-channel-select"
                                            value={expressionChannel}
                                            onChange={(event) => setExpressionChannel(event.target.value)}
                                            style={{ backgroundColor: 'gray', color: 'white', height: '2rem', width: '10rem', marginBottom: '10px', marginLeft: '10px' }}
                                            >
                                            {expressionChannelOptions.map((option, i) => <MenuItem key={`expressionChannelOption${i}`} value={i}>{option}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                </span>
                                <span>CC#
                                <TextField
                                    id="cc-number"
                                    disabled={!expressionStatus}
                                    variant='standard'
                                    value={expressionCC}
                                    onChange={(event) => setExpressionCC(event.target.value)}
                                    sx={{ backgroundColor: 'gray', color: 'white', width: '80%', marginLeft: '10px' }}
                                />
                                </span>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', textAlign: 'left', marginRight: '10px' }}>
                                <span>Utility
                                    <FormControlLabel
                                            control={
                                            <Switch
                                                checked={utilityStatus}
                                                onChange={() => setUtilityStatus(!utilityStatus)}
                                                name="utility-status"
                                                color="primary"
                                            />
                                            }
                                            label={utilityStatus ? "On" : "Off"}
                                            sx={{ marginLeft: '10px' }}
                                    />
                                </span>
                                <span>Mode
                                    <FormControl>
                                        {/* <InputLabel id="preset-select-label" style={{ color: 'white' }}>Preset Select</InputLabel> */}
                                        <Select
                                            autoWidth
                                            disabled={!utilityStatus}
                                            id="utility-mode-select"
                                            value={utilityMode}
                                            onChange={(event) => setUtilityMode(event.target.value)}
                                            style={{ backgroundColor: 'gray', color: 'white', height: '2rem', width: '10rem', marginBottom: '10px', marginLeft: '10px' }}
                                            >
                                            {utilityModeOptions.map((option, i) => <MenuItem key={`utilityModeOption${i}`} value={i}>{option}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                </span>
                                <span>BPM
                                    <TextField
                                        id="utility-bpm"
                                        disabled={!utilityStatus}
                                        variant='standard'
                                        value={utilityBPM}
                                        onChange={(event) => setUtilityBPM(event.target.value)}
                                        sx={{ backgroundColor: 'gray', color: 'white', width: '80%', marginLeft: '10px' }}
                                    />
                                </span>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', textAlign: 'left', marginRight: '10px' }}>
                                <span>Midi Clock
                                    <FormControlLabel
                                            control={
                                            <Switch
                                                checked={midiClockStatus}
                                                onChange={() => setMidiClockStatus(!midiClockStatus)}
                                                name="midi-clock-status"
                                                color="primary"
                                            />
                                            }
                                            label={midiClockStatus ? "On" : "Off"}
                                            sx={{ marginLeft: '10px' }}
                                    />
                                </span>
                                <span>On Press
                                    <Button variant='contained' disabled={!midiClockStatus} onClick={() => setMidiOnPressAction(!midiOnPressAction)} sx={{ marginLeft: '10px' }}>{midiOnPressAction ? "Start Clock" : "Stop Clock"}</Button>
                                </span>
                                <span>BPM
                                    <TextField
                                        id="midi-bpm"
                                        disabled={!midiClockStatus}
                                        variant='standard'
                                        value={midiBPM}
                                        onChange={(event) => setMidiBPM(event.target.value)}
                                        sx={{ backgroundColor: 'gray', color: 'white', width: '80%', marginLeft: '10px' }}
                                    />
                                </span>
                            </Box>
                        </Box>
                    </Box>
                    <Box id='preset-actions' sx={{ display: 'flex', flexDirection: 'column', marginLeft: '50px', marginTop: '10px' }}>
                        <Button variant='outlined' onClick={() => alert('Update Preset!')} sx={{ marginLeft: '10px' }}>Update Preset</Button>
                        <Button variant='outlined' onClick={() => alert('Save as New!')} sx={{ marginLeft: '10px' }}>Save as New</Button>
                        <Button variant='outlined' onClick={() => alert('Clear!')} sx={{ marginLeft: '10px' }}>Clear</Button>
                        <Button variant='outlined' onClick={() => alert('Cancel!')} sx={{ marginLeft: '10px' }}>Cancel</Button>
                    </Box>
                </Box>
            </Box>
        </>
    )
}

export default PresetEditor;