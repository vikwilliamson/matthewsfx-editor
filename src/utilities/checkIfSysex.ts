export const checkIfSysex = (message: Uint8Array) => {
     if (message[0] === 0xf0 && message[message.length - 1] === 0xf7) {
        return true;
     }

     return false;
}