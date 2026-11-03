import { useCallback } from 'react';
import { useBoardStore } from '../store/boardStore';
import { screenToWorld, Vec } from '../geometry/math';

export function useImageIngest() {
  const store = useBoardStore();

  const processFiles = useCallback(
    async (files: File[], targetScreenPt?: Vec) => {
      const imageFiles = files.filter((f) => f.type.startsWith('image/'));
      if (imageFiles.length === 0) return;

      const viewportCenter: Vec = targetScreenPt || {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      };

      const startWorld = screenToWorld(viewportCenter, store.camera);

      const itemsToAdd: Array<{
        blob: Blob;
        name: string;
        naturalWidth: number;
        naturalHeight: number;
        worldX: number;
        worldY: number;
        displayWidth: number;
        displayHeight: number;
      }> = [];

      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        const blob = file;

        // Load natural dimensions
        const { width, height } = await getImageDimensions(blob);

        // Compute sensible initial display dimensions (max 650px or ~50% of screen)
        const maxDisplaySize = 600 / store.camera.zoom;
        const scale = Math.min(
          1,
          maxDisplaySize / Math.max(width, height)
        );

        const displayWidth = Math.round(width * scale);
        const displayHeight = Math.round(height * scale);

        // Stagger multiple images slightly
        const cascadeOffset = i * 35;
        const worldX = startWorld.x - displayWidth / 2 + cascadeOffset;
        const worldY = startWorld.y - displayHeight / 2 + cascadeOffset;

        itemsToAdd.push({
          blob,
          name: file.name,
          naturalWidth: width,
          naturalHeight: height,
          worldX,
          worldY,
          displayWidth,
          displayHeight,
        });
      }

      await store.addImages(itemsToAdd);
    },
    [store]
  );

  const openFilePicker = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files) {
        processFiles(Array.from(target.files));
      }
    };
    input.click();
  }, [processFiles]);

  return {
    processFiles,
    openFilePicker,
  };
}

function getImageDimensions(blob: Blob): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      resolve({ width: 400, height: 300 });
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}
