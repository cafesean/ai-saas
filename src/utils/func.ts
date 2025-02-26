export const base64ToArrayBuffer = (base64String: string) => {
  const binaryString = atob(base64String);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

const mimeTypes = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
  'application/zip': 'zip',
  'text/plain': 'txt',
  'audio/mpeg': 'mp3',
  'audio/wav': 'wav',
};

export const getFileExtension = (base64String: string) => {
  const mimeType = base64String.split(';')[0]?.split(':')[1];
  return mimeTypes[mimeType as keyof typeof mimeTypes] || 'unknown';
}