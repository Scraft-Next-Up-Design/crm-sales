export function extractUserNameAndTimestamp(
  notes: string[]
): { message: string; userName: string | null; timestamp: string | null }[] {
  const regex = /\(added by\s+([^\)]+)\s+at\s+([^\)]+)\)/;

  return notes.map((noteText) => {
    const match = noteText.match(regex);

    if (match) {
      const userName = match[1];
      const timestamp = match[2];
      // Remove the "(added by ... at timestamp)" part to get the message
      const message = noteText.replace(regex, "").trim();
      return { message, userName, timestamp };
    } else {
      return { message: noteText, userName: null, timestamp: null };
    }
  });
}
