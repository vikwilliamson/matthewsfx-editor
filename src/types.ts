export type Bank = {
    bankName: string;
    presets: Preset[];
}

export enum EditorTab {
    Creators = 'Smart Creators',
    Editor = 'Preset Editor',
    Organizer = 'Preset Organizer',
    Settings = 'Global Settings'
};

export type FirmwareVersionResponse = {
    [key: string]: number | string;
    mfxId1: number;
    mfxId2: number;
    mfxId3: number;
    productIdMsb: number;
    productIdLsb: number;
    commandByte: number;
    majorVersion10: number;
    majorVersion1: number;
    minorVersion10: number;
    minorVersion1: number;
}

export type GlobalSettingsProps = {
    midiAccess: WebMidi.MIDIAccess | null;
    status: string;
    deviceSettings: GlobalSettingsResponse;
}

export type GlobalSettingsResponse = {
    [key: string]: number;
    mfxId1: number;
    mfxId2: number;
    mfxId3: number;
    productIdLsb: number;
    productIdMsb: number;
    commandByte: number;
    tapStatus: number;
    tapStatusMode: number;
    switch1Function: number;
    switch2Function: number;
    switch3Function: number;
    switch4Function: number;
    switch5Function: number;
    switch6Function: number;
    switch7Function: number;
    contrast: number;
    brightness: number;
    controlJackMode: number;
    midiClockState: number;
    midiClockLsb: number;
    midiClockMsb: number;
    utilityJackPolarity: number;
    utilityJackMode: number;
    midiInputChannel: number;
}

export interface MidiOutputRef {
    current: WebMidi.MIDIOutput | undefined;
  }
  
export type Preset = {
    presetName: string;
    presetDescription?: string;
    messages: Array<Array<string>>;
}

export type PresetMessage = {
    [key: string]: number | null;
    mfxId1: number;
    mfxId2: number;
    mfxId3: number;
    productIdLsb: number;
    productIdMsb: number;
    commandByte: number;
    bankNum: number;
    presetNum: number;
    presetNameVal1: number | null;
    presetNameVal2: number | null;
    presetNameVal3: number | null;
    presetNameVal4: number | null;
    presetNameVal5: number | null;
    presetNameVal6: number | null;
    presetNameVal7: number | null;
    presetNameVal8: number | null;
    m1Mode: number;
    m1MidiCh: number;
    m1MidiCmd: number;
    m1Val1: number;
    m1Val2: number;
    m2Mode: number;
    m2MidiCh: number;
    m2MidiCmd: number;
    m2Val1: number;
    m2Val2: number;
    m3Mode: number;
    m3MidiCh: number;
    m3MidiCmd: number;
    m3Val1: number;
    m3Val2: number;
    m4Mode: number;
    m4MidiCh: number;
    m4MidiCmd: number;
    m4Val1: number;
    m4Val2: number;
    m5Mode: number;
    m5MidiCh: number;
    m5MidiCmd: number;
    m5al1: number;
    m5Val2: number;
    m6Mode: number;
    m6MidiCh: number;
    m6MidiCmd: number;
    m6Val1: number;
    m6Val2: number;
    m7Mode: number;
    m7MidiCh: number;
    m7MidiCmd: number;
    m7Val1: number;
    m7Val2: number;
    m8Mode: number;
    m8MidiCh: number;
    m8MidiCmd: number;
    m8Val1: number;
    m8Val2: number;
    m9Mode: number;
    m9MidiCh: number;
    m9MidiCmd: number;
    m9Val1: number;
    m9Val2: number;
    m10Mode: number;
    m10MidiCh: number;
    m10MidiCmd: number;
    m10Val1: number;
    m10Val2: number;
    m11Mode: number;
    m11MidiCh: number;
    m11MidiCmd: number;
    m11Val1: number;
    m11Val2: number;
    m12Mode: number;
    m12MidiCh: number;
    m12MidiCmd: number;
    m12Val1: number;
    m12Val2: number;
    m13Mode: number;
    m13MidiCh: number;
    m13MidiCmd: number;
    m13Val1: number;
    m13Val2: number;
    m14Mode: number;
    m14MidiCh: number;
    m14MidiCmd: number;
    m14Val1: number;
    m14Val2: number;
    m15Mode: number;
    m15MidiCh: number;
    m15MidiCmd: number;
    m15Val1: number;
    m15Val2: number;
    m16Mode: number;
    m16MidiCh: number;
    m16MidiCmd: number;
    m16Val1: number;
    m16Val2: number;
    expression: number;
    expressionMidiCh: number;
    expressionMidiCCNum: number;
    utilityMode: number;
    utilityBpmLsb: number;
    utilityBpmMsb: number;
    patchMidiClockSettings: number;
    midiClockBpmLsb: number;
    midiClockBpmMsb: number;
    presetDescriptionVal1: number;
    presetDescriptionVal2: number;
    presetDescriptionVal3: number;
    presetDescriptionVal4: number;
    presetDescriptionVal5: number;
    presetDescriptionVal6: number;
    presetDescriptionVal7: number;
    presetDescriptionVal8: number;
    presetDescriptionVal9: number;
    presetDescriptionVal10: number;
    presetDescriptionVal11: number;
    presetDescriptionVal12: number;
    presetDescriptionVal13: number;
    presetDescriptionVal14: number;
    presetDescriptionVal15: number;
    presetDescriptionVal16: number;
    presetDescriptionVal17: number;
    presetDescriptionVal18: number;
    presetDescriptionVal19: number;
    presetDescriptionVal20: number;
    presetDescriptionVal21: number;
    presetDescriptionVal22: number;
    presetDescriptionVal23: number;
    presetDescriptionVal24: number;
    presetDescriptionVal25: number;
    presetDescriptionVal26: number;
    presetDescriptionVal27: number;
    presetDescriptionVal28: number;
    presetDescriptionVal29: number;
    presetDescriptionVal30: number;
    presetDescriptionVal31: number;
    presetDescriptionVal32: number;
    presetDescriptionVal33: number;
    presetDescriptionVal34: number;
    presetDescriptionVal35: number;
    presetDescriptionVal36: number;
    presetDescriptionVal37: number;
    presetDescriptionVal38: number;
    presetDescriptionVal39: number;
    presetDescriptionVal40: number;
    presetDescriptionVal41: number;
    presetDescriptionVal42: number;
    presetDescriptionVal43: number;
    presetDescriptionVal44: number;
    presetDescriptionVal45: number;
    presetDescriptionVal46: number;
    presetDescriptionVal47: number;
    presetDescriptionVal48: number;
    presetDescriptionVal49: number;
    presetDescriptionVal50: number;
    presetDescriptionVal51: number;
    presetDescriptionVal52: number;
    presetDescriptionVal53: number;
    presetDescriptionVal54: number;
    presetDescriptionVal55: number;
    dateVal1: number;
    dateVal2: number;
    dateVal3: number;
    dateVal4: number;
    dateVal5: number;
    dateVal6: number;
    dateVal7: number;
    dateVal8: number;
    dateVal9: number;
}

export type SetStateAction<T> = (value: T | ((prev: T) => T)) => void;
