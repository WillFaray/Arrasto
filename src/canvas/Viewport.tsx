import React, { useRef, useState, useEffect } from 'react';
import { useBoardStore } from '../store/boardStore';
import { WorldLayer } from './WorldLayer';
import { SelectionOverlay } from '../overlay/SelectionOverlay';
import { Marquee } from '../overlay/Marquee';
import { RecordingArea } from '../overlay/RecordingArea';
import { TopBar } from '../ui/TopBar';
import { ObsPanel } from '../ui/ObsPanel';
import { EmptyState } from '../ui/EmptyState';
import { useInteraction } from './useInteraction';
import { useImageIngest } from './useImageIngest';
import { CURSORS } from '../cursors/cursors';

export const Viewport: React.FC = () => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewportSize, setViewportSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [isObsPanelOpen, setIsObsPanelOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const store = useBoardStore();
  const {
    images,
    selection,
    camera,
    mode,
    recordingArea,
    background,
    isInteracting,
    setRecordingArea,
    initFromStorage,
  } = store;

  const {
    marqueeRect,
    handleWheel,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  } = useInteraction(viewportRef);

  const { processFiles, openFilePicker } = useImageIngest();

  // Load from IndexedDB on startup
  useEffect(() => {
    initFromStorage();
  }, [initFromStorage]);

  // Window resize handler
  useEffect(() => {
    const handleResize = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Global Clipboard Paste (Ctrl+V) listener
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Check if html contains an original image source URL.
      // In Chromium on Windows, 'Copy Image' from a webpage flattens transparent PNGs
      // to a solid-white 24-bit bitmap on the system clipboard.
      // By extracting the original URL from text/html, we can fetch the original
      // transparent file directly and bypass Windows clipboard's white flattening!
      const html = e.clipboardData?.getData('text/html');
      if (html) {
        try {
          const doc = new DOMParser().parseFromString(html, 'text/html');
          const imgEl = doc.querySelector('img');
          if (imgEl && imgEl.src) {
            const resp = await fetch(imgEl.src);
            if (resp.ok) {
              const blob = await resp.blob();
              if (blob.type.startsWith('image/')) {
                e.preventDefault();
                const file = new File([blob], 'image.png', { type: blob.type });
                processFiles([file]);
                return;
              }
            }
          }
        } catch {
          // If fetch fails (e.g. CORS or invalid source), fallback to standard clipboard items below
        }
      }

      const items = e.clipboardData?.items;
      if (!items) return;

      const imageFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) imageFiles.push(file);
        }
      }

      if (imageFiles.length > 0) {
        e.preventDefault();
        processFiles(imageFiles);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [processFiles]);

  // Drag and drop files from desktop/explorer
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer?.files) {
      const files = Array.from(e.dataTransfer.files);
      const dropPoint = { x: e.clientX, y: e.clientY };
      processFiles(files, dropPoint);
    }
  };

  // Selected images objects
  const selectedImages = images.filter((img) => selection.includes(img.id));

  // Background pattern calculation
  const getBackgroundStyle = (): React.CSSProperties => {
    const bgKind = background.kind;
    const isLight =
      background.theme === 'light' || background.color.toLowerCase() === '#ffffff';
    const baseColor = isLight ? '#ffffff' : (background.color || '#0e1014');

    if (bgKind === 'solid') {
      return { backgroundColor: baseColor };
    }

    const dotSize = Math.max(1, 1.25 * camera.zoom);
    const spacing = 32 * camera.zoom;
    const offsetX = (camera.x % spacing + spacing) % spacing;
    const offsetY = (camera.y % spacing + spacing) % spacing;

    if (bgKind === 'dots') {
      const dotColor = isLight ? 'rgba(0, 0, 0, 0.16)' : 'rgba(255, 255, 255, 0.15)';
      return {
        backgroundColor: baseColor,
        backgroundImage: `radial-gradient(circle, ${dotColor} ${dotSize}px, transparent ${dotSize}px)`,
        backgroundSize: `${spacing}px ${spacing}px`,
        backgroundPosition: `${offsetX}px ${offsetY}px`,
      };
    }

    // Grid
    const gridColor = isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.05)';
    return {
      backgroundColor: baseColor,
      backgroundImage: `
        linear-gradient(to right, ${gridColor} 1px, transparent 1px),
        linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)
      `,
      backgroundSize: `${spacing}px ${spacing}px`,
      backgroundPosition: `${offsetX}px ${offsetY}px`,
    };
  };

  return (
    <div
      ref={viewportRef}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onContextMenu={(e) => e.preventDefault()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'none',
        cursor: CURSORS.default,
        ...getBackgroundStyle(),
      }}
    >
      {/* World Layer with all high-resolution images */}
      <WorldLayer
        camera={camera}
        images={images}
        selection={selection}
        mode={mode}
        isInteracting={isInteracting}
      />

      {/* Selection Overlay (Active ONLY in Edit mode) */}
      {mode === 'edit' && (
        <SelectionOverlay
          camera={camera}
          selectedImages={selectedImages}
          isInteracting={isInteracting}
        />
      )}

      {/* Marquee Selection Box (shown during dragging on empty space) */}
      <Marquee rect={marqueeRect} />

      {/* Recording Area Overlay */}
      <RecordingArea
        state={recordingArea}
        viewport={viewportSize}
        onUpdate={setRecordingArea}
        onCloseAdjust={() => setRecordingArea({ adjusting: false })}
      />

      {/* Top Bar Navigation */}
      <TopBar
        onUploadClick={openFilePicker}
        onOpenObs={() => setIsObsPanelOpen(true)}
        viewport={viewportSize}
      />

      {/* Empty State Help Card */}
      {images.length === 0 && (
        <EmptyState onUploadClick={openFilePicker} />
      )}

      {/* Drag Over Window Indicator */}
      {isDragOver && (
        <div
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            right: 16,
            bottom: 16,
            border: '2px dashed #6366f1',
            borderRadius: 20,
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#a5b4fc',
            fontSize: 20,
            fontWeight: 700,
            zIndex: 90,
            pointerEvents: 'none',
          }}
        >
          Solte as imagens aqui para adicionar ao quadro
        </div>
      )}

      {/* OBS Crop Modal */}
      <ObsPanel
        recordingRect={recordingArea.rect}
        viewport={viewportSize}
        isOpen={isObsPanelOpen}
        onClose={() => setIsObsPanelOpen(false)}
      />
    </div>
  );
};
