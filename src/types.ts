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
  
export type Preset = {
    presetName: string;
    presetDescription?: string;
    messages: Array<Array<string>>;
}
export type SetStateAction<T> = (value: T | ((prev: T) => T)) => void;
