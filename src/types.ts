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
  
export type Preset = {
    presetName: string;
    presetDescription?: string;
    messages: Array<Array<string>>;
}
export type SetStateAction<T> = (value: T | ((prev: T) => T)) => void;
