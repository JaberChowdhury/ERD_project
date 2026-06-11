import * as fflate from 'fflate';

export function compressToUrl(payload: string): string {
  const buf = fflate.strToU8(payload);
  const compressed = fflate.compressSync(buf, { level: 9 });
  return bytesToBase64Url(compressed);
}

export function decompressFromUrl(base64url: string): string {
  const compressed = base64UrlToBytes(base64url);
  const decompressed = fflate.decompressSync(compressed);
  return fflate.strFromU8(decompressed);
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToBytes(base64url: string): Uint8Array {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
