// COMPONENTS
import Card from '@mui/material/Card';
// ASSETS/DATA
import { Bank, Preset } from '../../types';

type LeftSideBarProps = {
    userBanks: Bank[];
}

const LeftSideBar: React.FC<LeftSideBarProps> = ({ userBanks }: LeftSideBarProps) => {
    const allBanks = Array.from({ length: 30 }, (bank, index) => {
        return userBanks[index] ?? { bankName: `Bank ${index + 1}`, presets: [] }
      })

    return(
        <div style={{ backgroundColor: '#222327', color: 'white', height: '100vh', overflow: 'auto', width: '100%', paddingRight: '3px'  }}>
            <h3 style={{ textDecoration: 'underline' }}>PRESETS</h3>
            {allBanks.map((bank, i) => {
                // Create an array of preset cells to display inside a given bank
                const presetCells = Array.from({ length: 7 }, (cell, index) => {
                    let preset: Preset | undefined = undefined;
                    let prefix;
                    if(index < bank.presets.length) {
                    preset = bank.presets[index];

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
                        <div key={`${bank.bankName}/${preset?.presetName ?? ''}${index}`} style={{ display: 'flex', justifyContent: 'left', paddingLeft: '5px' }}>
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
                        <div key={`${bank.bankName}/${''}${index}`} style={{ display: 'flex', justifyContent: 'left', paddingLeft: '5px' }}>
                            {`${prefix}. `}
                        </div>
                        );
                }
                
                    
                });

                return ( 
                        <Card key={`${bank.bankName}${i}`} sx={{ backgroundColor: '#0f0e13', color: 'white', marginBottom: '1rem', paddingBottom: '0.5rem' }}>
                            <p style={{ textDecoration: 'underline' }}>{bank.bankName}</p>
                            {presetCells}
                        </Card>
                    )})}
        </div>
    )
}

export default LeftSideBar;