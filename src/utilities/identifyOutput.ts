export const identifyOutput = (access: WebMidi.MIDIAccess | null) => {
    let output;
    const outputIterator = access?.outputs.entries();
    const portID = outputIterator ? outputIterator?.next().value?.[1].id : null;

    if(portID) {
        output = access?.outputs.get(portID);
    }
    
    return output;
}
