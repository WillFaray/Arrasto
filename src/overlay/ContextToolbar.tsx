import React from 'react';
import {
  Lock,
  Unlock,
  ChevronsUp,
  ChevronUp,
  ChevronDown,
  ChevronsDown,
  Maximize2,
  RotateCcw,
  Copy,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { useBoardStore } from '../store/boardStore';

interface ContextToolbarProps {
  screenX: number;
  screenY: number;
  isLocked: boolean;
}

export const ContextToolbar: React.FC<ContextToolbarProps> = ({
  screenX,
  screenY,
  isLocked,
}) => {
  const {
    toggleLockSelected,
    bringToFront,
    bringForward,
    sendBackward,
    sendToBack,
    setOneToOne,
    resetRotation,
    removeWhiteBackgroundFromSelected,
    duplicateSelected,
    removeSelected,
  } = useBoardStore();

  // Position toolbar nicely above the selection, flipping below if near top of window
  const toolbarHeight = 44;
  const isNearTop = screenY - toolbarHeight - 14 < 60;
  const top = isNearTop ? screenY + 20 : screenY - toolbarHeight - 14;

  const buttonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: 8,
    border: 'none',
    background: 'transparent',
    color: '#e2e8f0',
    cursor: 'pointer',
    transition: 'background 0.15s ease, color 0.15s ease, transform 0.1s ease',
  };

  const dividerStyle: React.CSSProperties = {
    width: 1,
    height: 18,
    background: 'rgba(255, 255, 255, 0.12)',
    margin: '0 4px',
  };

  return (
    <div
      onPointerDown={(e) => e.stopPropagation()}
      style={{
        position: 'absolute',
        left: screenX,
        top,
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        padding: '4px 6px',
        background: 'rgba(22, 23, 29, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: 12,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.45)',
        zIndex: 50,
        pointerEvents: 'auto',
        userSelect: 'none',
      }}
    >
      {/* Lock / Unlock */}
      <button
        style={{
          ...buttonStyle,
          color: isLocked ? '#f87171' : '#e2e8f0',
        }}
        onClick={toggleLockSelected}
        title={isLocked ? 'Desbloquear (L)' : 'Bloquear (L)'}
      >
        {isLocked ? <Lock size={16} /> : <Unlock size={16} />}
      </button>

      <div style={dividerStyle} />

      {!isLocked && (
        <>
          {/* Layer Controls */}
          <button
            style={buttonStyle}
            onClick={() => bringToFront()}
            title="Trazer para o topo (Shift + ])"
          >
            <ChevronsUp size={16} />
          </button>
          <button
            style={buttonStyle}
            onClick={() => bringForward()}
            title="Avançar camada (])"
          >
            <ChevronUp size={16} />
          </button>
          <button
            style={buttonStyle}
            onClick={() => sendBackward()}
            title="Recuar camada ([)"
          >
            <ChevronDown size={16} />
          </button>
          <button
            style={buttonStyle}
            onClick={() => sendToBack()}
            title="Enviar para o fundo (Shift + [)"
          >
            <ChevronsDown size={16} />
          </button>

          <div style={dividerStyle} />

          {/* 1:1 Actual Resolution */}
          <button
            style={buttonStyle}
            onClick={() => setOneToOne()}
            title="Tamanho real 1:1 da imagem"
          >
            <Maximize2 size={16} />
          </button>

          {/* Reset Rotation */}
          <button
            style={buttonStyle}
            onClick={() => resetRotation()}
            title="Resetar rotação para 0°"
          >
            <RotateCcw size={16} />
          </button>

          {/* Remove White Background / Make Transparent */}
          <button
            style={{
              ...buttonStyle,
              color: '#38bdf8',
            }}
            onClick={removeWhiteBackgroundFromSelected}
            title="Remover Fundo Branco (Tornar Transparente)"
          >
            <Sparkles size={16} />
          </button>

          <div style={dividerStyle} />

          {/* Duplicate */}
          <button
            style={buttonStyle}
            onClick={duplicateSelected}
            title="Duplicar (Ctrl + D)"
          >
            <Copy size={16} />
          </button>
        </>
      )}

      {/* Delete */}
      <button
        style={{
          ...buttonStyle,
          color: '#f87171',
        }}
        onClick={removeSelected}
        title="Remover (Delete)"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};
