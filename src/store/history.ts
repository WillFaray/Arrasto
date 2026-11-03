import { BoardImage } from '../types/board';

export interface HistoryState {
  undoStack: BoardImage[][];
  redoStack: BoardImage[][];
}

const MAX_HISTORY = 60;

export function createHistoryState(): HistoryState {
  return {
    undoStack: [],
    redoStack: [],
  };
}

export function pushHistorySnapshot(
  history: HistoryState,
  currentImages: BoardImage[]
): HistoryState {
  const newUndo = [...history.undoStack, currentImages.map((img) => ({ ...img }))];
  if (newUndo.length > MAX_HISTORY) {
    newUndo.shift();
  }
  return {
    undoStack: newUndo,
    redoStack: [],
  };
}

export function performUndo(
  history: HistoryState,
  currentImages: BoardImage[]
): {
  history: HistoryState;
  restoredImages: BoardImage[];
} | null {
  if (history.undoStack.length === 0) return null;

  const newUndo = [...history.undoStack];
  const previous = newUndo.pop()!;
  const newRedo = [...history.redoStack, currentImages.map((img) => ({ ...img }))];

  return {
    history: {
      undoStack: newUndo,
      redoStack: newRedo,
    },
    restoredImages: previous,
  };
}

export function performRedo(
  history: HistoryState,
  currentImages: BoardImage[]
): {
  history: HistoryState;
  restoredImages: BoardImage[];
} | null {
  if (history.redoStack.length === 0) return null;

  const newRedo = [...history.redoStack];
  const next = newRedo.pop()!;
  const newUndo = [...history.undoStack, currentImages.map((img) => ({ ...img }))];

  return {
    history: {
      undoStack: newUndo,
      redoStack: newRedo,
    },
    restoredImages: next,
  };
}
