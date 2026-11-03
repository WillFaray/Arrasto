import { get, set, del, keys } from 'idb-keyval';
import { BoardDocument, BoardImage } from '../types/board';

const DOC_KEY = 'whiteboard_studio_doc_v1';
const BLOB_PREFIX = 'whiteboard_studio_blob_';

export async function saveBlob(blobId: string, blob: Blob): Promise<void> {
  await set(`${BLOB_PREFIX}${blobId}`, blob);
}

export async function getBlob(blobId: string): Promise<Blob | undefined> {
  return await get<Blob>(`${BLOB_PREFIX}${blobId}`);
}

export async function deleteBlob(blobId: string): Promise<void> {
  await del(`${BLOB_PREFIX}${blobId}`);
}

let saveTimeout: ReturnType<typeof setTimeout> | null = null;

export function debounceSaveDocument(doc: BoardDocument, delayMs = 350): void {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(async () => {
    try {
      await set(DOC_KEY, doc);
    } catch (err) {
      console.error('Error saving board document to IndexedDB:', err);
    }
  }, delayMs);
}

export async function loadPersistedBoard(): Promise<{
  doc: BoardDocument | null;
  images: BoardImage[];
}> {
  try {
    const doc = await get<BoardDocument>(DOC_KEY);
    if (!doc || !Array.isArray(doc.images)) {
      return { doc: null, images: [] };
    }

    const loadedImages: BoardImage[] = [];
    const usedBlobIds = new Set<string>();

    for (const item of doc.images) {
      usedBlobIds.add(item.blobId);
      const blob = await getBlob(item.blobId);
      if (blob) {
        const blobUrl = URL.createObjectURL(blob);
        loadedImages.push({
          ...item,
          blobUrl,
        });
      } else {
        console.warn(`Blob with id ${item.blobId} not found in IndexedDB.`);
      }
    }

    // Background cleanup of orphaned blobs
    cleanupOrphanedBlobs(usedBlobIds).catch((err) =>
      console.warn('Orphan blob cleanup warning:', err)
    );

    return { doc, images: loadedImages };
  } catch (err) {
    console.error('Failed to load persisted board from IndexedDB:', err);
    return { doc: null, images: [] };
  }
}

async function cleanupOrphanedBlobs(usedBlobIds: Set<string>): Promise<void> {
  const allKeys = await keys();
  for (const k of allKeys) {
    if (typeof k === 'string' && k.startsWith(BLOB_PREFIX)) {
      const blobId = k.slice(BLOB_PREFIX.length);
      if (!usedBlobIds.has(blobId)) {
        await del(k);
      }
    }
  }
}
