import { describe, it, expect, beforeEach } from 'vitest';
import { useBoardStore } from './boardStore';
import { createHistoryState } from './history';

describe('Board Store Actions', () => {
  beforeEach(() => {
    useBoardStore.setState({
      images: [
        {
          id: '1',
          blobId: 'b1',
          blobUrl: 'blob:test-1',
          name: 'img1',
          x: 0,
          y: 0,
          width: 100,
          height: 100,
          naturalWidth: 200,
          naturalHeight: 200,
          rotation: 0,
          locked: false,
        },
        {
          id: '2',
          blobId: 'b2',
          blobUrl: 'blob:test-2',
          name: 'img2',
          x: 50,
          y: 50,
          width: 100,
          height: 100,
          naturalWidth: 200,
          naturalHeight: 200,
          rotation: 0,
          locked: false,
        },
      ],
      selection: ['1'],
      history: createHistoryState(),
      mode: 'edit',
    });
  });

  it('duplicates selected images and updates selection to the new images', () => {
    const store = useBoardStore.getState();
    store.duplicateSelected();

    const state = useBoardStore.getState();
    expect(state.images.length).toBe(3);
    const duplicated = state.images[2];
    expect(duplicated.x).toBe(30);
    expect(duplicated.y).toBe(30);
    expect(state.selection).toEqual([duplicated.id]);
  });

  it('locks and unlocks selected images', () => {
    const store = useBoardStore.getState();
    store.toggleLockSelected();
    expect(useBoardStore.getState().images[0].locked).toBe(true);

    store.toggleLockSelected();
    expect(useBoardStore.getState().images[0].locked).toBe(false);
  });

  it('reorders layers with bringToFront and sendToBack', () => {
    const store = useBoardStore.getState();
    // initially [1, 2]
    store.bringToFront('1');
    expect(useBoardStore.getState().images.map((img) => img.id)).toEqual(['2', '1']);

    store.sendToBack('1');
    expect(useBoardStore.getState().images.map((img) => img.id)).toEqual(['1', '2']);
  });

  it('handles undo and redo', () => {
    const store = useBoardStore.getState();
    store.removeSelected();
    expect(useBoardStore.getState().images.length).toBe(1);

    store.undo();
    expect(useBoardStore.getState().images.length).toBe(2);

    store.redo();
    expect(useBoardStore.getState().images.length).toBe(1);
  });

  it('toggles between dark and light background theme', () => {
    const store = useBoardStore.getState();
    expect(useBoardStore.getState().background.theme).toBe('dark');
    expect(useBoardStore.getState().background.color).toBe('#0e1014');

    store.toggleBackgroundTheme();
    expect(useBoardStore.getState().background.theme).toBe('light');
    expect(useBoardStore.getState().background.color).toBe('#ffffff');

    store.toggleBackgroundTheme();
    expect(useBoardStore.getState().background.theme).toBe('dark');
    expect(useBoardStore.getState().background.color).toBe('#0e1014');
  });
});
