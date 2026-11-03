import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useBoardStore } from '../store/boardStore';
import {
  screenToWorld,
  rectIntersectsRotatedRect,
  Vec,
  Rect,
} from '../geometry/math';
import {
  HandleType,
  resizeItem,
  rotateItem,
  TransformableItem,
} from '../geometry/transform';

type DragMode =
  | 'none'
  | 'pending_move'
  | 'moving_images'
  | 'panning'
  | 'resizing'
  | 'rotating'
  | 'marquee'
  | 'adjusting_recording_move'
  | 'adjusting_recording_resize';

export function useInteraction(viewportRef: React.RefObject<HTMLDivElement | null>) {
  const store = useBoardStore();

  const [marqueeRect, setMarqueeRect] = useState<Rect | null>(null);

  // Interaction tracking refs
  const dragModeRef = useRef<DragMode>('none');
  const startPointerScreenRef = useRef<Vec>({ x: 0, y: 0 });
  const lastPointerScreenRef = useRef<Vec>({ x: 0, y: 0 });
  const startPointerWorldRef = useRef<Vec>({ x: 0, y: 0 });

  // Stored state at start of drag
  const startImagesMapRef = useRef<Map<string, TransformableItem>>(new Map());
  const activeHandleRef = useRef<HandleType | null>(null);
  const activeItemIdRef = useRef<string | null>(null);
  const recordingHandleRef = useRef<string | null>(null);
  const startRecordingRectRef = useRef<Rect>({ x: 0, y: 0, width: 0, height: 0 });

  const spacePressedRef = useRef(false);

  // Keyboard shortcut listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is inside an input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.code === 'Space') {
        spacePressedRef.current = true;
      }

      if (e.key === 'e' || e.key === 'E') {
        store.setMode('edit');
      } else if (e.key === 'a' || e.key === 'A') {
        store.setMode('action');
      } else if (e.key === 'l' || e.key === 'L') {
        store.toggleLockSelected();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        store.removeSelected();
      } else if (e.key === 'Escape') {
        store.clearSelection();
        if (store.recordingArea.adjusting) {
          store.setRecordingArea({ adjusting: false });
        }
      } else if (e.key === 'r' || e.key === 'R') {
        store.toggleRecordingAdjust();
      } else if (e.key === 'b' || e.key === 'B') {
        store.toggleBackgroundTheme();
      } else if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' || e.key === 'Z') {
          e.preventDefault();
          if (e.shiftKey) {
            store.redo();
          } else {
            store.undo();
          }
        } else if (e.key === 'y' || e.key === 'Y') {
          e.preventDefault();
          store.redo();
        } else if (e.key === 'd' || e.key === 'D') {
          e.preventDefault();
          store.duplicateSelected();
        } else if (e.key === 'a' || e.key === 'A') {
          e.preventDefault();
          store.selectAll();
        }
      } else if (
        ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)
      ) {
        if (store.selection.length > 0) {
          e.preventDefault();
          const step = e.shiftKey ? 10 : 2;
          let dx = 0;
          let dy = 0;
          if (e.key === 'ArrowLeft') dx = -step;
          if (e.key === 'ArrowRight') dx = step;
          if (e.key === 'ArrowUp') dy = -step;
          if (e.key === 'ArrowDown') dy = step;

          store.startInteraction();
          const selSet = new Set(store.selection);
          store.updateImagesLive(
            store.images
              .filter((img) => selSet.has(img.id) && !img.locked)
              .map((img) => ({
                id: img.id,
                partial: { x: img.x + dx, y: img.y + dy },
              }))
          );
          store.commitTransaction();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        spacePressedRef.current = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [store]);

  // Wheel zoom handler
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const rect = viewportRef.current?.getBoundingClientRect();
      const screenPt: Vec = {
        x: e.clientX - (rect?.left || 0),
        y: e.clientY - (rect?.top || 0),
      };

      // Zoom factor
      const zoomFactor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
      store.zoomAtCursor(screenPt, zoomFactor);
    },
    [store, viewportRef]
  );

  // Pointer Down
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      const target = e.target as HTMLElement;
      const clientPos: Vec = { x: e.clientX, y: e.clientY };

      startPointerScreenRef.current = clientPos;
      lastPointerScreenRef.current = clientPos;

      const worldPos = screenToWorld(clientPos, store.camera);
      startPointerWorldRef.current = worldPos;

      // 1. Panning: Middle click, right click, or space + left click
      if (e.button === 1 || e.button === 2 || (e.button === 0 && spacePressedRef.current)) {
        e.preventDefault();
        dragModeRef.current = 'panning';
        store.startInteraction();
        target.setPointerCapture(e.pointerId);
        return;
      }

      // We only handle primary left click for element/marquee manipulation
      if (e.button !== 0) return;

      // 2. Check if clicking on Recording Area Adjust handle
      const recordingHandle = target.closest('[data-recording-handle]')?.getAttribute('data-recording-handle');
      if (recordingHandle && store.recordingArea.adjusting) {
        recordingHandleRef.current = recordingHandle;
        startRecordingRectRef.current = { ...store.recordingArea.rect };
        dragModeRef.current =
          recordingHandle === 'move'
            ? 'adjusting_recording_move'
            : 'adjusting_recording_resize';
        store.startInteraction();
        target.setPointerCapture(e.pointerId);
        return;
      }

      // 3. Check if clicking on Transform Handle (only in edit mode)
      if (store.mode === 'edit') {
        const handle = target.closest('[data-handle]')?.getAttribute('data-handle') as HandleType | null;
        const itemId = target.closest('[data-handle]')?.getAttribute('data-item-id');
        if (handle && itemId) {
          activeHandleRef.current = handle;
          activeItemIdRef.current = itemId;
          const targetItem = store.images.find((img) => img.id === itemId);
          if (targetItem) {
            startImagesMapRef.current.set(itemId, { ...targetItem });
          }

          dragModeRef.current = handle === 'rot' ? 'rotating' : 'resizing';
          store.startInteraction();
          target.setPointerCapture(e.pointerId);
          return;
        }
      }

      // 4. Check if clicking on an Image Item
      const imageEl = target.closest('[data-image-id]');
      const imageId = imageEl?.getAttribute('data-image-id');

      if (imageId) {
        const clickedImage = store.images.find((img) => img.id === imageId);

        // In action mode, locked images are ignored
        if (store.mode === 'action' && clickedImage?.locked) {
          return;
        }

        const isShift = e.shiftKey;
        const isAlreadySelected = store.selection.includes(imageId);

        if (isShift) {
          store.toggleSelection(imageId);
        } else if (!isAlreadySelected) {
          store.setSelection([imageId]);
        }

        // Prepare for moving
        const currentSel = isShift
          ? store.selection.includes(imageId)
            ? store.selection
            : [...store.selection, imageId]
          : isAlreadySelected
          ? store.selection
          : [imageId];

        startImagesMapRef.current.clear();
        for (const id of currentSel) {
          const img = store.images.find((item) => item.id === id);
          if (img && !img.locked) {
            startImagesMapRef.current.set(id, { ...img });
          }
        }

        dragModeRef.current = 'pending_move';
        target.setPointerCapture(e.pointerId);
        return;
      }

      // 5. Clicked on empty canvas space -> Marquee selection
      if (!e.shiftKey) {
        store.clearSelection();
      }
      dragModeRef.current = 'marquee';
      setMarqueeRect({
        x: clientPos.x,
        y: clientPos.y,
        width: 0,
        height: 0,
      });
      target.setPointerCapture(e.pointerId);
    },
    [store]
  );

  // Pointer Move
  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const clientPos: Vec = { x: e.clientX, y: e.clientY };
      const mode = dragModeRef.current;

      if (mode === 'none') return;

      const screenDx = clientPos.x - startPointerScreenRef.current.x;
      const screenDy = clientPos.y - startPointerScreenRef.current.y;
      const dist = Math.hypot(screenDx, screenDy);

      // Panning
      if (mode === 'panning') {
        const deltaX = clientPos.x - lastPointerScreenRef.current.x;
        const deltaY = clientPos.y - lastPointerScreenRef.current.y;
        lastPointerScreenRef.current = clientPos;
        store.setCamera((prev) => ({
          ...prev,
          x: prev.x + deltaX,
          y: prev.y + deltaY,
        }));
        return;
      }

      // Pending move check threshold (4px)
      if (mode === 'pending_move') {
        if (dist > 4) {
          dragModeRef.current = 'moving_images';
          store.startInteraction();
        } else {
          return;
        }
      }

      // Moving images
      if (mode === 'moving_images') {
        const worldPos = screenToWorld(clientPos, store.camera);
        const worldDx = worldPos.x - startPointerWorldRef.current.x;
        const worldDy = worldPos.y - startPointerWorldRef.current.y;

        const updates: Array<{ id: string; partial: Partial<TransformableItem> }> = [];
        startImagesMapRef.current.forEach((startItem, id) => {
          updates.push({
            id,
            partial: {
              x: startItem.x + worldDx,
              y: startItem.y + worldDy,
            },
          });
        });

        store.updateImagesLive(updates);
        return;
      }

      // Resizing handle
      if (mode === 'resizing') {
        const handle = activeHandleRef.current;
        const itemId = activeItemIdRef.current;
        if (!handle || !itemId) return;

        const startItem = startImagesMapRef.current.get(itemId);
        if (!startItem) return;

        const worldPos = screenToWorld(clientPos, store.camera);
        const resized = resizeItem(startItem, handle, worldPos, {
          keepRatio: !e.shiftKey, // Default maintains aspect ratio; Shift allows free stretch
          fromCenter: e.altKey,
        });

        store.updateImageLive(itemId, resized);
        return;
      }

      // Rotating handle
      if (mode === 'rotating') {
        const itemId = activeItemIdRef.current;
        if (!itemId) return;

        const startItem = startImagesMapRef.current.get(itemId);
        if (!startItem) return;

        const worldPos = screenToWorld(clientPos, store.camera);
        const newRotation = rotateItem(startItem, worldPos, e.shiftKey); // Shift snaps to 15 deg

        store.updateImageLive(itemId, { rotation: newRotation });
        return;
      }

      // Marquee selection
      if (mode === 'marquee') {
        const start = startPointerScreenRef.current;
        const currentMarquee: Rect = {
          x: start.x,
          y: start.y,
          width: clientPos.x - start.x,
          height: clientPos.y - start.y,
        };
        setMarqueeRect(currentMarquee);

        // Convert marquee to world space to check intersection
        const tlScreen = {
          x: Math.min(start.x, clientPos.x),
          y: Math.min(start.y, clientPos.y),
        };
        const brScreen = {
          x: Math.max(start.x, clientPos.x),
          y: Math.max(start.y, clientPos.y),
        };
        const tlWorld = screenToWorld(tlScreen, store.camera);
        const brWorld = screenToWorld(brScreen, store.camera);

        const worldMarquee: Rect = {
          x: tlWorld.x,
          y: tlWorld.y,
          width: brWorld.x - tlWorld.x,
          height: brWorld.y - tlWorld.y,
        };

        const matchingIds: string[] = [];
        for (const img of store.images) {
          if (img.locked) continue;
          if (
            rectIntersectsRotatedRect(
              worldMarquee,
              { x: img.x, y: img.y, width: img.width, height: img.height },
              img.rotation
            )
          ) {
            matchingIds.push(img.id);
          }
        }

        store.setSelection(matchingIds);
        return;
      }

      // Recording area move
      if (mode === 'adjusting_recording_move') {
        const startR = startRecordingRectRef.current;
        store.setRecordingArea({
          rect: {
            ...startR,
            x: startR.x + screenDx,
            y: startR.y + screenDy,
          },
        });
        return;
      }

      // Recording area resize
      if (mode === 'adjusting_recording_resize') {
        const h = recordingHandleRef.current;
        const startR = startRecordingRectRef.current;
        let newX = startR.x;
        let newY = startR.y;
        let newW = startR.width;
        let newH = startR.height;

        if (h?.includes('e')) newW = Math.max(100, startR.width + screenDx);
        if (h?.includes('s')) newH = Math.max(100, startR.height + screenDy);
        if (h?.includes('w')) {
          const clampedDx = Math.min(screenDx, startR.width - 100);
          newX = startR.x + clampedDx;
          newW = startR.width - clampedDx;
        }
        if (h?.includes('n')) {
          const clampedDy = Math.min(screenDy, startR.height - 100);
          newY = startR.y + clampedDy;
          newH = startR.height - clampedDy;
        }

        // Apply aspect ratio preset if locked
        const aspect = store.recordingArea.aspect;
        if (aspect === '16:9') newH = (newW * 9) / 16;
        else if (aspect === '9:16') newH = (newW * 16) / 9;
        else if (aspect === '1:1') newH = newW;
        else if (aspect === '4:3') newH = (newW * 3) / 4;

        store.setRecordingArea({
          rect: {
            x: Math.round(newX),
            y: Math.round(newY),
            width: Math.round(newW),
            height: Math.round(newH),
          },
        });
        return;
      }
    },
    [store]
  );

  // Pointer Up
  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      const mode = dragModeRef.current;

      if (
        mode === 'moving_images' ||
        mode === 'resizing' ||
        mode === 'rotating'
      ) {
        store.commitTransaction();
      } else if (mode === 'panning') {
        store.endInteraction();
      }

      dragModeRef.current = 'none';
      setMarqueeRect(null);
      activeHandleRef.current = null;
      activeItemIdRef.current = null;
      recordingHandleRef.current = null;
      startImagesMapRef.current.clear();

      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Ignored if capture wasn't held
      }
    },
    [store]
  );

  return {
    marqueeRect,
    handleWheel,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  };
}
