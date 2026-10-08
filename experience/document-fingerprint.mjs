// Hash original bytes before storage; also retain the normalized image hash so
// documents saved by older versions can participate in duplicate detection.
export async function documentHash(blob) {
  const digest = await crypto.subtle.digest('SHA-256', await blob.arrayBuffer());
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}

export function isDuplicateDocument(candidate, documents) {
  const hashes = [candidate.fileHash, candidate.contentHash].filter(Boolean);
  return documents.some(document => hashes.some(hash => hash === document.fileHash || hash === document.contentHash));
}
