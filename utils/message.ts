export function extractUserNameAndTimestamp(noteText: string): {
    userName: string | null;
    timestamp: string | null;
  } {
    // Regular expression to match the user name and timestamp
    const regex = /\(added by\s+([^\)]+)\s+at\s+([^\)]+)\)/;
    const match = noteText.match(regex);
  
    if (match) {
      const userName = match[1];  // Extracted user name
      const timestamp = match[2]; // Extracted timestamp
      return { userName, timestamp };
    } else {
      return { userName: null, timestamp: null }; // If the format is incorrect
    }
  }
  