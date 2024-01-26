import { Bank, Preset } from "../containers/App";

type LeftSideBarProps = {
    banks: Bank[];
}

const LeftSideBar: React.FC<LeftSideBarProps> = ({ banks }: LeftSideBarProps) => {

    return(
        <div style={{ border: '2px solid white', height: '100vh', width: '100%', color: 'white' }}>
            <h3 style={{ textDecoration: 'underline' }}>PRESETS</h3>
            {banks.map((bank, i) => {
                // Create an array of preset cells to display inside a given bank
                const presetCells = Array.from({ length: 7 }, (cell, index) => {
                    let preset: Preset | undefined = undefined;
                    let prefix;
                    if(index < bank.presets.length) {
                    preset = bank.presets[index];
                    console.log('Preset for Cell', preset)

                    // Extract this logic
                    if (index + 1 === 5) {
                        prefix = 'A';
                    } else if (index + 1 === 6) {
                        prefix = 'B';
                    } else if (index + 1 === 7) {
                        prefix = 'C';
                    } else {
                        prefix = index + 1;
                    }

                    return (
                        // Extract reused style
                        <div key={`${bank.bankName}/${preset?.presetName ?? ''}${index}`} style={{ display: 'flex', justifyContent: 'left' }}>
                            {`${prefix}. ${preset.presetName}`}
                        </div>
                        );
                }
                else {
                    if (index + 1 === 5) {
                        prefix = 'A';
                    } else if (index + 1 === 6) {
                        prefix = 'B';
                    } else if (index + 1 === 7) {
                        prefix = 'C';
                    } else {
                        prefix = index + 1;
                    }

                    return (
                        <div key={`${bank.bankName}/${''}${index}`} style={{ display: 'flex', justifyContent: 'left' }}>
                            {`${prefix}. `}
                        </div>
                        );
                }
                
                    
                });

                return ( 
                        <div key={`${bank.bankName}${i}`} style={{ border: '1px solid white', marginBottom: '1rem' }}>
                            <p style={{ textDecoration: 'underline' }}>{bank.bankName}</p>
                            {presetCells}
                        </div>
                    )})}
        </div>
    )
}

export default LeftSideBar;