import React from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface EmptyStateProps {
  onUploadClick: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onUploadClick }) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '36px 48px',
        background: 'rgba(18, 20, 26, 0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px dashed rgba(255, 255, 255, 0.15)',
        borderRadius: 24,
        boxShadow: '0 24px 64px rgba(0, 0, 0, 0.5)',
        maxWidth: 480,
        pointerEvents: 'auto',
        userSelect: 'none',
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 20,
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(168, 85, 247, 0.25))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#818cf8',
          marginBottom: 18,
          boxShadow: '0 8px 24px rgba(99, 102, 241, 0.2)',
        }}
      >
        <ImageIcon size={32} />
      </div>

      <h1
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: '#f8fafc',
          margin: '0 0 8px 0',
          letterSpacing: '-0.02em',
        }}
      >
        Whiteboard Studio
      </h1>

      <p
        style={{
          fontSize: 14,
          color: '#94a3b8',
          margin: '0 0 24px 0',
          lineHeight: 1.5,
        }}
      >
        Cole imagens com <kbd style={kbdStyle}>Ctrl + V</kbd>, arraste arquivos para esta tela ou clique no botão abaixo.
      </p>

      <button
        onClick={onUploadClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
          color: '#ffffff',
          border: 'none',
          padding: '12px 24px',
          borderRadius: 12,
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: '0 4px 18px rgba(99, 102, 241, 0.4)',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        }}
      >
        <Upload size={18} />
        Fazer Upload de Imagem
      </button>

      <div
        style={{
          marginTop: 28,
          paddingTop: 20,
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          gap: 20,
          fontSize: 12,
          color: '#64748b',
        }}
      >
        <div><kbd style={kbdStyle}>E</kbd> Edição</div>
        <div><kbd style={kbdStyle}>A</kbd> Ação</div>
        <div><kbd style={kbdStyle}>B</kbd> Fundo Preto/Branco</div>
        <div><kbd style={kbdStyle}>R</kbd> Gravação OBS</div>
        <div><kbd style={kbdStyle}>Espaço</kbd> Mover Tela</div>
      </div>
    </div>
  );
};

const kbdStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.1)',
  padding: '2px 6px',
  borderRadius: 4,
  fontSize: 11,
  color: '#e2e8f0',
  fontFamily: 'inherit',
  border: '1px solid rgba(255, 255, 255, 0.15)',
};
