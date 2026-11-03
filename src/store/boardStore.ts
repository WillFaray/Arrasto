import { create } from 'zustand';
import {
  BoardImage,
  InteractionMode,
  RecordingAreaState,
  BackgroundConfig,
  BoardDocument,
} from '../types/board';
import { Camera, Rect, screenToWorld, zoomAt } from '../geometry/math';
import {
  createHistoryState,
  HistoryState,
  performRedo,
  performUndo,
  pushHistorySnapshot,
} from './history';
import {
  debounceSaveDocument,
  loadPersistedBoard,
  saveBlob,
  getBlob,
} from './persistence';
import { removeWhiteBackground } from '../utils/imageUtils';

export interface BoardStore {
  // Data
  images: BoardImage[];
  selection: string[]; // Selected image IDs
  camera: Camera;
  mode: InteractionMode;
  recordingArea: RecordingAreaState;
  background: BackgroundConfig;
  isInteracting: boolean;
  history: HistoryState;
  isLoaded: boolean;

  // Snapshot before interaction started (for undo on pointerup)
  interactionStartSnapshot: BoardImage[] | null;

  // Init
  initFromStorage: () => Promise<void>;

  // Selection
  setSelection: (ids: string[]) => void;
  toggleSelection: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;

  // Mode
  setMode: (mode: InteractionMode) => void;
  toggleMode: () => void;

  // Camera
  setCamera: (cam: Camera | ((prev: Camera) => Camera)) => void;
  zoomAtCursor: (screenPt: { x: number; y: number }, factor: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  fitToContent: (viewport: { width: number; height: number }) => void;

  // Interaction lifecycle
  startInteraction: () => void;
  endInteraction: () => void;

  // Image Transformations & Actions
  addImages: (newItems: Array<{
    blob: Blob;
    name: string;
    naturalWidth: number;
    naturalHeight: number;
    worldX: number;
    worldY: number;
    displayWidth: number;
    displayHeight: number;
  }>) => Promise<string[]>;

  updateImageLive: (id: string, partial: Partial<BoardImage>) => void;
  updateImagesLive: (updates: Array<{ id: string; partial: Partial<BoardImage> }>) => void;
  commitTransaction: () => void;

  removeSelected: () => void;
  duplicateSelected: () => void;
  toggleLockSelected: () => void;
  setLocked: (ids: string[], locked: boolean) => void;

  bringForward: (id?: string) => void;
  sendBackward: (id?: string) => void;
  bringToFront: (id?: string) => void;
  sendToBack: (id?: string) => void;

  resetRotation: (id?: string) => void;
  setOneToOne: (id?: string) => void;
  removeWhiteBackgroundFromSelected: () => Promise<void>;

  // Recording Area
  setRecordingArea: (partial: Partial<RecordingAreaState>) => void;
  toggleRecordingVisible: () => void;
  toggleRecordingAdjust: () => void;

  // Background
  setBackground: (bg: Partial<BackgroundConfig>) => void;
  toggleBackgroundTheme: () => void;

  // Undo / Redo
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

const DEFAULT_RECORDING_RECT: Rect = {
  x: 80,
  y: 70,
  width: 960,
  height: 540,
};

function triggerSave(get: () => BoardStore): void {
  const state = get();
  const doc: BoardDocument = {
    version: 1,
    camera: state.camera,
    mode: state.mode,
    recordingArea: state.recordingArea,
    background: state.background,
    images: state.images.map((img) => ({
      id: img.id,
      blobId: img.blobId,
      name: img.name,
      x: img.x,
      y: img.y,
      width: img.width,
      height: img.height,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      rotation: img.rotation,
      locked: img.locked,
    })),
  };
  debounceSaveDocument(doc);
}

export const useBoardStore = create<BoardStore>((set, get) => ({
  images: [],
  selection: [],
  camera: { x: 0, y: 0, zoom: 1 },
  mode: 'edit',
  recordingArea: {
    visible: false,
    adjusting: false,
    rect: DEFAULT_RECORDING_RECT,
    aspect: '16:9',
    dim: 0.65,
  },
  background: {
    kind: 'dots',
    theme: 'dark',
    color: '#0e1014',
  },
  isInteracting: false,
  history: createHistoryState(),
  isLoaded: false,
  interactionStartSnapshot: null,

  initFromStorage: async () => {
    const { doc, images } = await loadPersistedBoard();
    if (doc) {
      set({
        camera: doc.camera || { x: 0, y: 0, zoom: 1 },
        mode: doc.mode || 'edit',
        recordingArea: doc.recordingArea || {
          visible: false,
          adjusting: false,
          rect: DEFAULT_RECORDING_RECT,
          aspect: '16:9',
          dim: 0.65,
        },
        background: doc.background
          ? {
              kind: doc.background.kind || 'dots',
              theme: doc.background.theme || (doc.background.color === '#ffffff' ? 'light' : 'dark'),
              color: doc.background.color || '#0e1014',
            }
          : { kind: 'dots', theme: 'dark', color: '#0e1014' },
        images,
        isLoaded: true,
      });
    } else {
      set({ isLoaded: true });
    }
  },

  setSelection: (ids: string[]) => {
    set({ selection: ids });
  },

  toggleSelection: (id: string) => {
    const current = get().selection;
    if (current.includes(id)) {
      set({ selection: current.filter((item) => item !== id) });
    } else {
      set({ selection: [...current, id] });
    }
  },

  selectAll: () => {
    const unlockedIds = get()
      .images.filter((img) => !img.locked)
      .map((img) => img.id);
    set({ selection: unlockedIds });
  },

  clearSelection: () => {
    set({ selection: [] });
  },

  setMode: (mode: InteractionMode) => {
    set({ mode });
    triggerSave(get);
  },

  toggleMode: () => {
    const nextMode = get().mode === 'edit' ? 'action' : 'edit';
    set({ mode: nextMode });
    triggerSave(get);
  },

  setCamera: (camOrFn) => {
    set((state) => ({
      camera: typeof camOrFn === 'function' ? camOrFn(state.camera) : camOrFn,
    }));
    triggerSave(get);
  },

  zoomAtCursor: (screenPt, factor) => {
    set((state) => ({
      camera: zoomAt(state.camera, screenPt, factor),
    }));
    triggerSave(get);
  },

  zoomIn: () => {
    const center = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    set((state) => ({
      camera: zoomAt(state.camera, center, 1.25),
    }));
    triggerSave(get);
  },

  zoomOut: () => {
    const center = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    set((state) => ({
      camera: zoomAt(state.camera, center, 1 / 1.25),
    }));
    triggerSave(get);
  },

  resetZoom: () => {
    const center = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const currentCam = get().camera;
    const w = screenToWorld(center, currentCam);
    set({
      camera: {
        zoom: 1,
        x: center.x - w.x,
        y: center.y - w.y,
      },
    });
    triggerSave(get);
  },

  fitToContent: (viewport) => {
    const images = get().images;
    if (images.length === 0) return;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const img of images) {
      minX = Math.min(minX, img.x);
      minY = Math.min(minY, img.y);
      maxX = Math.max(maxX, img.x + img.width);
      maxY = Math.max(maxY, img.y + img.height);
    }

    const contentW = maxX - minX;
    const contentH = maxY - minY;
    if (contentW <= 0 || contentH <= 0) return;

    const pad = 80;
    const availW = Math.max(100, viewport.width - pad * 2);
    const availH = Math.max(100, viewport.height - pad * 2);

    const fitZoom = Math.min(availW / contentW, availH / contentH, 1.5);
    const centerX = minX + contentW / 2;
    const centerY = minY + contentH / 2;

    set({
      camera: {
        zoom: fitZoom,
        x: viewport.width / 2 - centerX * fitZoom,
        y: viewport.height / 2 - centerY * fitZoom,
      },
    });
    triggerSave(get);
  },

  startInteraction: () => {
    set({
      isInteracting: true,
      interactionStartSnapshot: get().images.map((img) => ({ ...img })),
    });
  },

  endInteraction: () => {
    set({ isInteracting: false });
  },

  addImages: async (newItems) => {
    const currentImages = get().images;
    const createdIds: string[] = [];
    const addedImages: BoardImage[] = [];

    // Push current state to undo history
    const newHistory = pushHistorySnapshot(get().history, currentImages);

    for (const item of newItems) {
      const id = 'img_' + Math.random().toString(36).slice(2, 10);
      const blobId = 'blob_' + Math.random().toString(36).slice(2, 12);
      await saveBlob(blobId, item.blob);
      const blobUrl = URL.createObjectURL(item.blob);

      createdIds.push(id);
      addedImages.push({
        id,
        blobId,
        blobUrl,
        name: item.name,
        x: item.worldX,
        y: item.worldY,
        width: item.displayWidth,
        height: item.displayHeight,
        naturalWidth: item.naturalWidth,
        naturalHeight: item.naturalHeight,
        rotation: 0,
        locked: false,
      });
    }

    set({
      images: [...currentImages, ...addedImages],
      selection: createdIds,
      history: newHistory,
      isInteracting: false,
    });

    triggerSave(get);
    return createdIds;
  },

  updateImageLive: (id, partial) => {
    set((state) => ({
      images: state.images.map((img) =>
        img.id === id ? { ...img, ...partial } : img
      ),
    }));
  },

  updateImagesLive: (updates) => {
    const updateMap = new Map(updates.map((u) => [u.id, u.partial]));
    set((state) => ({
      images: state.images.map((img) => {
        const patch = updateMap.get(img.id);
        return patch ? { ...img, ...patch } : img;
      }),
    }));
  },

  commitTransaction: () => {
    const snapshot = get().interactionStartSnapshot;
    if (snapshot) {
      // Check if anything actually changed
      const current = get().images;
      const changed =
        snapshot.length !== current.length ||
        snapshot.some((before, i) => {
          const after = current[i];
          return (
            !after ||
            before.x !== after.x ||
            before.y !== after.y ||
            before.width !== after.width ||
            before.height !== after.height ||
            before.rotation !== after.rotation ||
            before.locked !== after.locked
          );
        });

      if (changed) {
        const newHistory = pushHistorySnapshot(get().history, snapshot);
        set({ history: newHistory });
        triggerSave(get);
      }
    }
    set({
      interactionStartSnapshot: null,
      isInteracting: false,
    });
  },

  removeSelected: () => {
    const sel = new Set(get().selection);
    if (sel.size === 0) return;

    const current = get().images;
    const newHistory = pushHistorySnapshot(get().history, current);
    const remaining = current.filter((img) => !sel.has(img.id));

    set({
      images: remaining,
      selection: [],
      history: newHistory,
    });
    triggerSave(get);
  },

  duplicateSelected: () => {
    const sel = new Set(get().selection);
    if (sel.size === 0) return;

    const current = get().images;
    const newHistory = pushHistorySnapshot(get().history, current);
    const duplicates: BoardImage[] = [];
    const newSelectedIds: string[] = [];

    for (const img of current) {
      if (sel.has(img.id)) {
        const newId = 'img_' + Math.random().toString(36).slice(2, 10);
        newSelectedIds.push(newId);
        duplicates.push({
          ...img,
          id: newId,
          x: img.x + 30,
          y: img.y + 30,
        });
      }
    }

    set({
      images: [...current, ...duplicates],
      selection: newSelectedIds,
      history: newHistory,
    });
    triggerSave(get);
  },

  toggleLockSelected: () => {
    const sel = new Set(get().selection);
    if (sel.size === 0) return;

    const current = get().images;
    const hasUnlocked = current.some((img) => sel.has(img.id) && !img.locked);
    const targetLockedState = hasUnlocked;

    const newHistory = pushHistorySnapshot(get().history, current);
    set({
      images: current.map((img) =>
        sel.has(img.id) ? { ...img, locked: targetLockedState } : img
      ),
      history: newHistory,
    });
    triggerSave(get);
  },

  setLocked: (ids, locked) => {
    const targetSet = new Set(ids);
    const current = get().images;
    const newHistory = pushHistorySnapshot(get().history, current);
    set({
      images: current.map((img) =>
        targetSet.has(img.id) ? { ...img, locked } : img
      ),
      history: newHistory,
    });
    triggerSave(get);
  },

  bringForward: (id) => {
    const targetId = id || get().selection[0];
    if (!targetId) return;

    const images = [...get().images];
    const index = images.findIndex((img) => img.id === targetId);
    if (index < 0 || index >= images.length - 1) return;

    const newHistory = pushHistorySnapshot(get().history, images);
    const temp = images[index];
    images[index] = images[index + 1];
    images[index + 1] = temp;

    set({ images, history: newHistory });
    triggerSave(get);
  },

  sendBackward: (id) => {
    const targetId = id || get().selection[0];
    if (!targetId) return;

    const images = [...get().images];
    const index = images.findIndex((img) => img.id === targetId);
    if (index <= 0) return;

    const newHistory = pushHistorySnapshot(get().history, images);
    const temp = images[index];
    images[index] = images[index - 1];
    images[index - 1] = temp;

    set({ images, history: newHistory });
    triggerSave(get);
  },

  bringToFront: (id) => {
    const targetId = id || get().selection[0];
    if (!targetId) return;

    const images = [...get().images];
    const index = images.findIndex((img) => img.id === targetId);
    if (index < 0 || index === images.length - 1) return;

    const newHistory = pushHistorySnapshot(get().history, images);
    const [item] = images.splice(index, 1);
    images.push(item);

    set({ images, history: newHistory });
    triggerSave(get);
  },

  sendToBack: (id) => {
    const targetId = id || get().selection[0];
    if (!targetId) return;

    const images = [...get().images];
    const index = images.findIndex((img) => img.id === targetId);
    if (index <= 0) return;

    const newHistory = pushHistorySnapshot(get().history, images);
    const [item] = images.splice(index, 1);
    images.unshift(item);

    set({ images, history: newHistory });
    triggerSave(get);
  },

  resetRotation: (id) => {
    const ids = id ? [id] : get().selection;
    if (ids.length === 0) return;
    const targetSet = new Set(ids);
    const current = get().images;
    const newHistory = pushHistorySnapshot(get().history, current);

    set({
      images: current.map((img) =>
        targetSet.has(img.id) ? { ...img, rotation: 0 } : img
      ),
      history: newHistory,
    });
    triggerSave(get);
  },

  setOneToOne: (id) => {
    const ids = id ? [id] : get().selection;
    if (ids.length === 0) return;
    const targetSet = new Set(ids);
    const current = get().images;
    const newHistory = pushHistorySnapshot(get().history, current);

    set({
      images: current.map((img) => {
        if (!targetSet.has(img.id)) return img;
        const centerX = img.x + img.width / 2;
        const centerY = img.y + img.height / 2;
        const newW = img.naturalWidth;
        const newH = img.naturalHeight;
        return {
          ...img,
          width: newW,
          height: newH,
          x: centerX - newW / 2,
          y: centerY - newH / 2,
        };
      }),
      history: newHistory,
    });
    triggerSave(get);
  },

  removeWhiteBackgroundFromSelected: async () => {
    const sel = get().selection;
    if (sel.length === 0) return;

    const current = get().images;
    const newHistory = pushHistorySnapshot(get().history, current);

    const updatedImages = [...current];
    for (const id of sel) {
      const idx = updatedImages.findIndex((img) => img.id === id);
      if (idx >= 0) {
        const item = updatedImages[idx];
        const blob = await getBlob(item.blobId);
        if (blob) {
          const cleanedBlob = await removeWhiteBackground(blob);
          const newBlobId = 'blob_' + Math.random().toString(36).slice(2, 12);
          await saveBlob(newBlobId, cleanedBlob);
          const newUrl = URL.createObjectURL(cleanedBlob);
          updatedImages[idx] = {
            ...item,
            blobId: newBlobId,
            blobUrl: newUrl,
          };
        }
      }
    }

    set({ images: updatedImages, history: newHistory });
    triggerSave(get);
  },

  setRecordingArea: (partial) => {
    set((state) => ({
      recordingArea: {
        ...state.recordingArea,
        ...partial,
      },
    }));
    triggerSave(get);
  },

  toggleRecordingVisible: () => {
    set((state) => ({
      recordingArea: {
        ...state.recordingArea,
        visible: !state.recordingArea.visible,
      },
    }));
    triggerSave(get);
  },

  toggleRecordingAdjust: () => {
    set((state) => ({
      recordingArea: {
        ...state.recordingArea,
        visible: true,
        adjusting: !state.recordingArea.adjusting,
      },
    }));
    triggerSave(get);
  },

  setBackground: (bg) => {
    set((state) => ({
      background: {
        ...state.background,
        ...bg,
      },
    }));
    triggerSave(get);
  },

  toggleBackgroundTheme: () => {
    const currentTheme =
      get().background.theme ||
      (get().background.color === '#ffffff' ? 'light' : 'dark');
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    const nextColor = nextTheme === 'light' ? '#ffffff' : '#0e1014';
    set((state) => ({
      background: {
        ...state.background,
        theme: nextTheme,
        color: nextColor,
      },
    }));
    triggerSave(get);
  },

  undo: () => {
    const current = get().images;
    const result = performUndo(get().history, current);
    if (!result) return;

    set({
      images: result.restoredImages,
      history: result.history,
      selection: [],
    });
    triggerSave(get);
  },

  redo: () => {
    const current = get().images;
    const result = performRedo(get().history, current);
    if (!result) return;

    set({
      images: result.restoredImages,
      history: result.history,
      selection: [],
    });
    triggerSave(get);
  },

  canUndo: () => get().history.undoStack.length > 0,
  canRedo: () => get().history.redoStack.length > 0,
}));
