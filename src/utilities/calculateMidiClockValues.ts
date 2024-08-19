export const calculateMidiClockValues = (tempo: number) => {
    const midiClockMSB = Math.floor(tempo / 128);
    const midiClockLSB = tempo % 128;

    return { LSB: midiClockLSB, MSB: midiClockMSB };
};