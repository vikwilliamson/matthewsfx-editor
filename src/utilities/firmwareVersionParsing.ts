import { FirmwareVersionResponse } from "../types";

const retrieveAsciiCharacter = (value: number) => {
    try {   
      // Check if the value is within the valid ASCII range (32 to 126)
      if (value < 32 || value > 126) {
        throw new Error('Invalid ASCII value');
      }
      
      // Convert integer to ASCII character
      const charCode = parseInt(String(value), 10);
      const asciiChar = String.fromCharCode(charCode);
      
      return asciiChar;
    } catch (error) {
      console.error('Error converting hexadecimal to ASCII:', error);
    }
  };

export const parseInstalledFirmwareVersion = (response: FirmwareVersionResponse) => {
    const { majorVersion1, majorVersion10, minorVersion1, minorVersion10 } = response;
    const version = `${majorVersion10 === 32 ? '': retrieveAsciiCharacter(majorVersion10)}${retrieveAsciiCharacter(majorVersion1)}.${retrieveAsciiCharacter(minorVersion10)}${minorVersion1 === 32 ? '': retrieveAsciiCharacter(minorVersion1)}`;
    return version;
}