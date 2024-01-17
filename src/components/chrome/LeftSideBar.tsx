import { Bank } from "../containers/App";

type LeftSideBarProps = {
    banks: Bank[];
}

const LeftSideBar: React.FC<LeftSideBarProps> = ({ banks }: LeftSideBarProps) => {

    return(
        <div style={{ border: '2px solid black', height: '100vh', width: '100%' }}>
            <h3 style={{ textDecoration: 'underline' }}>PRESETS</h3>
            {banks.map((bank, i) => (
                <div key={i} style={{ border: '1px solid black', marginBottom: '1rem' }}>
                    <p>{bank.bankName}</p>
                    {bank.presets.map((preset, x) => (
                        <div key={x} style={{ border: '0.5px solid black' }}>
                            <p>{`${x+1}: ${preset.presetName}`}</p>
                        </div>
        ))}
                </div>
        ))}
        </div>
    )
}

export default LeftSideBar;