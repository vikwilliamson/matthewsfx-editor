// GLOBALS
import { useState } from "react";
// COMPONENTS
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
// DATA/UTILS
import { messageModeOptions, messageTypeOptions, mfxId1, mfxId2, mfxId3, numericChannelOptions, utilityModeOptions } from "../../utilities/constants";
import { PresetMessage } from "../../types";

const presetMessageInitialState: PresetMessage = {
    mfxId1: mfxId1,
    mfxId2: mfxId2,
    mfxId3: mfxId3,
    productIdLsb: 0x00,
    productIdMsb: 0x00,
    commandByte: 0x12, // Write Preset to unit 
    bankNum: 1,
    presetNum: 1,
    presetNameVal1: 0,
    presetNameVal2: 0,
    presetNameVal3: 0,
    presetNameVal4: 0,
    presetNameVal5: 0,
    presetNameVal6: 0,
    presetNameVal7: 0,
    presetNameVal8: 0,
    m1Mode: 0,
    m1MidiCh: 0,
    m1MidiCmd: 0,
    m1Val1: 0,
    m1Val2: 0,
    m2Mode: 0,
    m2MidiCh: 0,
    m2MidiCmd: 0,
    m2Val1: 0,
    m2Val2: 0,
    m3Mode: 0,
    m3MidiCh: 0,
    m3MidiCmd: 0,
    m3Val1: 0,
    m3Val2: 0,
    m4Mode: 0,
    m4MidiCh: 0,
    m4MidiCmd: 0,
    m4Val1: 0,
    m4Val2: 0,
    m5Mode: 0,
    m5MidiCh: 0,
    m5MidiCmd: 0,
    m5al1: 0,
    m5Val2: 0,
    m6Mode: 0,
    m6MidiCh: 0,
    m6MidiCmd: 0,
    m6Val1: 0,
    m6Val2: 0,
    m7Mode: 0,
    m7MidiCh: 0,
    m7MidiCmd: 0,
    m7Val1: 0,
    m7Val2: 0,
    m8Mode: 0,
    m8MidiCh: 0,
    m8MidiCmd: 0,
    m8Val1: 0,
    m8Val2: 0,
    m9Mode: 0,
    m9MidiCh: 0,
    m9MidiCmd: 0,
    m9Val1: 0,
    m9Val2: 0,
    m10Mode: 0,
    m10MidiCh: 0,
    m10MidiCmd: 0,
    m10Val1: 0,
    m10Val2: 0,
    m11Mode: 0,
    m11MidiCh: 0,
    m11MidiCmd: 0,
    m11Val1: 0,
    m11Val2: 0,
    m12Mode: 0,
    m12MidiCh: 0,
    m12MidiCmd: 0,
    m12Val1: 0,
    m12Val2: 0,
    m13Mode: 0,
    m13MidiCh: 0,
    m13MidiCmd: 0,
    m13Val1: 0,
    m13Val2: 0,
    m14Mode: 0,
    m14MidiCh: 0,
    m14MidiCmd: 0,
    m14Val1: 0,
    m14Val2: 0,
    m15Mode: 0,
    m15MidiCh: 0,
    m15MidiCmd: 0,
    m15Val1: 0,
    m15Val2: 0,
    m16Mode: 0,
    m16MidiCh: 0,
    m16MidiCmd: 0,
    m16Val1: 0,
    m16Val2: 0,
    expression: 0,
    expressionMidiCh: 0,
    expressionMidiCCNum: 0,
    utilityMode: 0,
    utilityBpmLsb: 0,
    utilityBpmMsb: 0,
    patchMidiClockSettings: 0,
    midiClockBpmLsb: 0,
    midiClockBpmMsb: 0,
    presetDescriptionVal1: 0,
    presetDescriptionVal2: 0,
    presetDescriptionVal3: 0,
    presetDescriptionVal4: 0,
    presetDescriptionVal5: 0,
    presetDescriptionVal6: 0,
    presetDescriptionVal7: 0,
    presetDescriptionVal8: 0,
    presetDescriptionVal9: 0,
    presetDescriptionVal10: 0,
    presetDescriptionVal11: 0,
    presetDescriptionVal12: 0,
    presetDescriptionVal13: 0,
    presetDescriptionVal14: 0,
    presetDescriptionVal15: 0,
    presetDescriptionVal16: 0,
    presetDescriptionVal17: 0,
    presetDescriptionVal18: 0,
    presetDescriptionVal19: 0,
    presetDescriptionVal20: 0,
    presetDescriptionVal21: 0,
    presetDescriptionVal22: 0,
    presetDescriptionVal23: 0,
    presetDescriptionVal24: 0,
    presetDescriptionVal25: 0,
    presetDescriptionVal26: 0,
    presetDescriptionVal27: 0,
    presetDescriptionVal28: 0,
    presetDescriptionVal29: 0,
    presetDescriptionVal30: 0,
    presetDescriptionVal31: 0,
    presetDescriptionVal32: 0,
    presetDescriptionVal33: 0,
    presetDescriptionVal34: 0,
    presetDescriptionVal35: 0,
    presetDescriptionVal36: 0,
    presetDescriptionVal37: 0,
    presetDescriptionVal38: 0,
    presetDescriptionVal39: 0,
    presetDescriptionVal40: 0,
    presetDescriptionVal41: 0,
    presetDescriptionVal42: 0,
    presetDescriptionVal43: 0,
    presetDescriptionVal44: 0,
    presetDescriptionVal45: 0,
    presetDescriptionVal46: 0,
    presetDescriptionVal47: 0,
    presetDescriptionVal48: 0,
    presetDescriptionVal49: 0,
    presetDescriptionVal50: 0,
    presetDescriptionVal51: 0,
    presetDescriptionVal52: 0,
    presetDescriptionVal53: 0,
    presetDescriptionVal54: 0,
    presetDescriptionVal55: 0,
    dateVal1: 0,
    dateVal2: 0,
    dateVal3: 0,
    dateVal4: 0,
    dateVal5: 0,
    dateVal6: 0,
    dateVal7: 0,
    dateVal8: 0,
    dateVal9: 0
}

const PresetEditor: React.FC = () => {
    let bankOptions = new Array(30).fill('').map((option, i) => `Bank ${i+1}`);
    let presetOptions = new Array(7).fill('').map((option, i) => `Preset ${i+1}`);

    const [presetMessage, setPresetMessage] = useState<PresetMessage>(presetMessageInitialState);
    const [selectedBank, setSelectedBank] = useState<string>('0');
    const [selectedPreset, setSelectedPreset] = useState<string>('0');
    const [selectedPresetName, setSelectedPresetName] = useState<string>('');
    const [selectedPresetDescription, setSelectedPresetDescription] = useState<string>('');

    const [isManual, setIsManual] = useState<boolean>(false);
    const [messageMode, setMessageMode] = useState<string | number>(0);
    const [messageChannel, setMessageChannel] = useState<string | number>(0);
    const [messageType, setMessageType] = useState<string | number>(0);
    const [ccNumberInput, setCcNumberInput] = useState<string>("");
    const [messageValueInput, setMessageValueInput] = useState<string>("");


    const [expressionStatus, setExpressionStatus] = useState<boolean>(false);
    const [expressionChannel, setExpressionChannel] = useState<string | number>(0);
    const [expressionCC, setExpressionCC] = useState<string>('');

    const [utilityStatus, setUtilityStatus] = useState<boolean>(false);
    const [utilityMode, setUtilityMode] = useState<string>('0');
    const [utilityBPM, setUtilityBPM] = useState<string>('');

    const [midiClockStatus, setMidiClockStatus] = useState<boolean>(false);
    const [midiOnPressAction, setMidiOnPressAction] = useState<boolean>(true);
    const [midiBPM, setMidiBPM] = useState<string>('');

    const [currentPresetMessage, setCurrentPresetMessage] = useState<number>(1);

    const updateMessage = (presetMessageProperty: number, newValue: string | number) => {
        const valueAsNum = typeof newValue === 'string' ? parseInt(newValue) : newValue;
        const newMessage = { ...presetMessage, [presetMessageProperty]: valueAsNum };

        // TODO: Add code here that performs special logic/validation
        // i.e: parsing ASCII for text inputs and validating BPMs

        setPresetMessage(newMessage);
    }

    return(
        <>
            <h1>Preset Editor</h1>
            <Box sx={{ backgroundColor: '#0f0e13', borderRadius: '3%', display: 'flex', flexDirection: 'column', height: '55vh', marginLeft: '5px', marginRight: '5px', paddingTop: '10px' }}>
                <Box sx={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
                <FormControl>
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
                <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly' }}>
                    <Box id='preset-messages' sx={{ width: '70%' }}>
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
                        <Box sx={{ mt: 1 }}>
                            {
                                !isManual && (<>
                                    <Button variant='outlined' onClick={() => setIsManual(true)} sx={{ marginLeft: '10px' }}>Manual</Button>
                                    <Button variant='outlined' onClick={() => alert('Smart Creation!')} sx={{ marginLeft: '10px' }}>Smart</Button>
                                    <Button variant='outlined' onClick={() => alert('Custom Creation!')} sx={{ marginLeft: '10px' }}>Custom</Button>
                                    <p color='white'>Select to create a message.</p>
                                </>)
                            }
                            {
                                isManual && (<Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly' }}>
                                    <FormControl>
                                        <Select
                                            autoWidth
                                            id="message-mode"
                                            value={messageMode}
                                            onChange={(event) => setMessageMode(event.target.value)}
                                            style={{ backgroundColor: 'gray', color: 'white', height: '2rem', width: '7rem', marginBottom: '10px', marginLeft: '10px' }}
                                            >
                                            {messageModeOptions.map((option, i) => <MenuItem key={`messageModeOption${i}`} value={i}>{option}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                    <FormControl>
                                        <Select
                                            autoWidth
                                            id="message-channel"
                                            value={messageChannel}
                                            onChange={(event) => setMessageChannel(event.target.value)}
                                            style={{ backgroundColor: 'gray', color: 'white', height: '2rem', width: '5rem', marginBottom: '10px', marginLeft: '10px' }}
                                            >
                                            {numericChannelOptions.map((option, i) => <MenuItem key={`messageChannelOption${i}`} value={i}>{option}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                    <FormControl>
                                        <Select
                                            autoWidth
                                            id="message-type"
                                            value={messageType}
                                            onChange={(event) => setMessageType(event.target.value)}
                                            style={{ backgroundColor: 'gray', color: 'white', height: '2rem', width: '7rem', marginBottom: '10px', marginLeft: '10px' }}
                                            >
                                            {messageTypeOptions.map((option, i) => <MenuItem key={`messageTypeOption${i}`} value={i}>{option}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                    <TextField
                                    id="cc-number-input"
                                    value={ccNumberInput}
                                    onChange={(event) => setCcNumberInput(event.target.value)}
                                    sx={{ backgroundColor: 'gray', color: 'white', height: '2rem', width: '25%', marginLeft: '10px' }}
                                />
                                <TextField
                                    id="message-value-input"
                                    value={messageValueInput}
                                    onChange={(event) => setMessageValueInput(event.target.value)}
                                    sx={{ backgroundColor: 'gray', color: 'white', height: '2rem', width: '25%', marginLeft: '10px' }}
                                />
                                </Box>)
                            }
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly' }}>
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
                                            {numericChannelOptions.map((option, i) => <MenuItem key={`expressionChannelOption${i}`} value={i}>{option}</MenuItem>)}
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
                    <Box id='preset-actions' sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Button variant='outlined' onClick={() => alert('Update Preset!')} sx={{ marginLeft: '10px' }}>Update Preset</Button>
                        <Button variant='outlined' onClick={() => alert('Save as New!')} sx={{ marginLeft: '10px' }}>Save as New</Button>
                        <Button variant='outlined' onClick={() => setIsManual(false)} sx={{ marginLeft: '10px' }}>Clear</Button>
                        <Button variant='outlined' onClick={() => alert('Cancel!')} sx={{ marginLeft: '10px' }}>Cancel</Button>
                    </Box>
                </Box>
            </Box>
        </>
    )
}

export default PresetEditor;