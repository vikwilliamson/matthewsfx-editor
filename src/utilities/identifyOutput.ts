export const identifyOutput = (access: WebMidi.MIDIAccess | null) => {
    const outputIterator = access?.outputs.entries();
    const portID = outputIterator ? outputIterator?.next().value[1].id : null;
    const output = access?.outputs.get(portID);

    return output;
}
