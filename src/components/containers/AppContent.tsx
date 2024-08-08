// COMPONENTS
import GlobalSettings from "../pages/GlobalSettings";
import PresetEditor from "../pages/PresetEditor";
import PresetOrganizer from "../pages/PresetOrganizer";
import SmartCreators from "../pages/SmartCreators";
// ASSETS/DATA
import { EditorTab, GlobalSettingsResponse } from "../../types";

type AppContentProps = {
    currentTab: EditorTab;
    deviceSettings: GlobalSettingsResponse;
    midiAccess: WebMidi.MIDIAccess | null;
    status: string;
}

const AppContent: React.FC<AppContentProps> = ({ currentTab, deviceSettings, midiAccess, status }: AppContentProps) => {
    // Determine content to render - default should be Preset Organizer
    let contentToRender;
    switch(currentTab) {
        case EditorTab.Creators: 
            contentToRender = <SmartCreators />;
            break;
        case EditorTab.Editor: 
            contentToRender = <PresetEditor />;
            break;
        case EditorTab.Settings: 
            contentToRender = <GlobalSettings deviceSettings={deviceSettings} midiAccess={midiAccess} status={status} />;
            break;
        case EditorTab.Organizer: 
        default:
            contentToRender = <PresetOrganizer />
    }

    return(
        <>
            {contentToRender}
        </>
    )
}

export default AppContent;