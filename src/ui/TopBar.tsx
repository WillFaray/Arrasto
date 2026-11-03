import React from 'react';
import {
  Upload,
  Edit3,
  Play,
  Minus,
  Plus,
  Maximize,
  Video,
  Undo2,
  Redo2,
  Grid,
  CircleDot,
  Square,
  Sun,
  Moon,
} from 'lucide-react';
import { useBoardStore } from '../store/boardStore';

interface TopBarProps {
  onUploadClick: () => void;
  onOpenObs: () => void;
  viewport: { width: number; height: number };
}

export const TopBar: React.FC<TopBarProps> = ({
  onUploadClick,
  onOpenObs,
  viewport,
}) => {
  const {
    mode,
    setMode,
    camera,
    zoomIn,
    zoomOut,
    resetZoom,
    fitToContent,
    undo,
    redo,
    canUndo,
    canRedo,
    recordingArea,
    toggleRecordingAdjust,
    background,
    setBackground,
    toggleBackgroundTheme,
  } = useBoardStore();

  const isUndoEnabled = canUndo();
  const isRedoEnabled = canRedo();

  const isLight =
    background.theme === 'light' || background.color.toLowerCase() === '#ffffff';
  const zoomPercent = Math.round(camera.zoom * 100);

  const buttonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 34,
    padding: '0 10px',
    borderRadius: 8,
    border: 'none',
    background: 'transparent',
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  };

  const dividerStyle: React.CSSProperties = {
    width: 1,
    height: 18,
    background: 'rgba(255, 255, 255, 0.1)',
    margin: '0 4px',
  };

  return (
    <header
      style={{
        position: 'absolute',
        top: 14,
        left: 16,
        right: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        pointerEvents: 'none',
        zIndex: 60,
      }}
    >
      {/* Left Segment: Logo, Upload */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '4px 6px',
          background: 'rgba(20, 22, 28, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: 14,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.45)',
          pointerEvents: 'auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '4px 10px',
          }}
        >
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Edit3 size={13} color="#ffffff" />
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#f8fafc', letterSpacing: '-0.01em' }}>
            Whiteboard Studio
          </span>
        </div>

        <div style={dividerStyle} />

        <button
          onClick={onUploadClick}
          style={{
            ...buttonStyle,
            background: 'rgba(99, 102, 241, 0.15)',
            color: '#a5b4fc',
            border: '1px solid rgba(99, 102, 241, 0.3)',
          }}
          title="Fazer Upload de Imagem (ou cole com Ctrl+V)"
        >
          <Upload size={15} />
          <span>Upload</span>
        </button>
      </div>

      {/* Center Segment: Mode Switcher (Edição vs Ação) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '4px',
          background: 'rgba(20, 22, 28, 0.88)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: 14,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.45)',
          pointerEvents: 'auto',
          userSelect: 'none',
        }}
      >
        <button
          onClick={() => setMode('edit')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            height: 32,
            padding: '0 14px',
            borderRadius: 10,
            border: 'none',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            background: mode === 'edit' ? '#6366f1' : 'transparent',
            color: mode === 'edit' ? '#ffffff' : '#94a3b8',
            boxShadow:
              mode === 'edit' ? '0 2px 10px rgba(99, 102, 241, 0.4)' : 'none',
          }}
          title="Modo Edição (E): Alças de redimensionar, rotacionar, camadas e bloqueio"
        >
          <Edit3 size={15} />
          <span>Edição (E)</span>
        </button>

        <button
          onClick={() => setMode('action')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            height: 32,
            padding: '0 14px',
            borderRadius: 10,
            border: 'none',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            background: mode === 'action' ? '#10b981' : 'transparent',
            color: mode === 'action' ? '#ffffff' : '#94a3b8',
            boxShadow:
              mode === 'action' ? '0 2px 10px rgba(16, 185, 129, 0.4)' : 'none',
          }}
          title="Modo Ação (A): Tela limpa para gravação. Sem alças ou bordas, permite mover e selecionar com caixa"
        >
          <Play size={15} />
          <span>Ação (A)</span>
        </button>
      </div>

      {/* Right Segment: Undo/Redo, Recording Area, OBS, Zoom */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '4px 8px',
          background: 'rgba(20, 22, 28, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: 14,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.45)',
          pointerEvents: 'auto',
        }}
      >
        {/* Undo / Redo */}
        <button
          onClick={undo}
          disabled={!isUndoEnabled}
          style={{
            ...buttonStyle,
            padding: '0 8px',
            opacity: isUndoEnabled ? 1 : 0.4,
            cursor: isUndoEnabled ? 'pointer' : 'default',
          }}
          title="Desfazer (Ctrl + Z)"
        >
          <Undo2 size={16} />
        </button>
        <button
          onClick={redo}
          disabled={!isRedoEnabled}
          style={{
            ...buttonStyle,
            padding: '0 8px',
            opacity: isRedoEnabled ? 1 : 0.4,
            cursor: isRedoEnabled ? 'pointer' : 'default',
          }}
          title="Refazer (Ctrl + Shift + Z / Ctrl + Y)"
        >
          <Redo2 size={16} />
        </button>

        <div style={dividerStyle} />

        {/* Toggle Black / White background */}
        <button
          onClick={toggleBackgroundTheme}
          style={{
            ...buttonStyle,
            padding: '0 8px',
            background: isLight ? 'rgba(255, 255, 255, 0.14)' : 'rgba(0, 0, 0, 0.35)',
            border: isLight
              ? '1px solid rgba(255, 255, 255, 0.3)'
              : '1px solid rgba(255, 255, 255, 0.1)',
            color: isLight ? '#f59e0b' : '#94a3b8',
          }}
          title={
            isLight
              ? 'Fundo Branco ativo (clique ou aperte B para Fundo Preto)'
              : 'Fundo Preto ativo (clique ou aperte B para Fundo Branco)'
          }
        >
          {isLight ? <Sun size={15} /> : <Moon size={15} />}
          <span style={{ fontSize: 12, fontWeight: 600, color: '#f8fafc' }}>
            {isLight ? 'Branco' : 'Preto'}
          </span>
        </button>

        {/* Background pattern switch: dots / grid / solid */}
        <button
          onClick={() => {
            const nextKind =
              background.kind === 'dots'
                ? 'grid'
                : background.kind === 'grid'
                ? 'solid'
                : 'dots';
            setBackground({ kind: nextKind });
          }}
          style={{ ...buttonStyle, padding: '0 8px' }}
          title={`Padrão do fundo: ${
            background.kind === 'dots'
              ? 'Pontos'
              : background.kind === 'grid'
              ? 'Grade'
              : 'Liso / Sólido'
          } (clique para alternar)`}
        >
          {background.kind === 'dots' && <CircleDot size={15} />}
          {background.kind === 'grid' && <Grid size={15} />}
          {background.kind === 'solid' && <Square size={15} />}
        </button>

        <div style={dividerStyle} />

        {/* Recording Area toggle */}
        <button
          onClick={toggleRecordingAdjust}
          style={{
            ...buttonStyle,
            background: recordingArea.adjusting
              ? 'rgba(239, 68, 68, 0.25)'
              : recordingArea.visible
              ? 'rgba(239, 68, 68, 0.12)'
              : 'transparent',
            color: recordingArea.visible ? '#f87171' : '#cbd5e1',
            border: recordingArea.adjusting
              ? '1px solid #ef4444'
              : '1px solid transparent',
          }}
          title="Área de Gravação (R): Ativar/Ajustar enquadramento do OBS"
        >
          <Video size={16} />
          <span>Área OBS</span>
        </button>

        {/* OBS Setup Modal */}
        <button
          onClick={onOpenObs}
          style={{
            ...buttonStyle,
            background: 'rgba(255, 255, 255, 0.06)',
            color: '#e2e8f0',
          }}
          title="Ver valores exatos de Recortar para colar no OBS Studio"
        >
          <span>Crop OBS</span>
        </button>

        <div style={dividerStyle} />

        {/* Zoom Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <button
            onClick={zoomOut}
            style={{ ...buttonStyle, padding: '0 6px' }}
            title="Diminuir Zoom"
          >
            <Minus size={15} />
          </button>

          <button
            onClick={resetZoom}
            style={{
              ...buttonStyle,
              padding: '0 8px',
              minWidth: 48,
              fontSize: 12,
              fontWeight: 600,
            }}
            title="Resetar Zoom para 100% (Ctrl + 0)"
          >
            {zoomPercent}%
          </button>

          <button
            onClick={zoomIn}
            style={{ ...buttonStyle, padding: '0 6px' }}
            title="Aumentar Zoom"
          >
            <Plus size={15} />
          </button>

          <button
            onClick={() => fitToContent(viewport)}
            style={{ ...buttonStyle, padding: '0 6px' }}
            title="Enquadrar todas as imagens (Shift + 1)"
          >
            <Maximize size={15} />
          </button>
        </div>
      </div>
    </header>
  );
};
