export const splitSysExMessages = (data: Uint8Array) => {
    const messages = [];
    let start = 0;

    while (start < data.length) {
        let end = data.indexOf(0xF7, start) + 1;
        if (end === 0) break; // No more end markers found
        const message = data.slice(start, end);
        messages.push(Array.from(message));
        start = end;
    }

    return messages;
}