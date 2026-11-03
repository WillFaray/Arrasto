import React, { useState, useEffect } from 'react';
import { Copy, Check, X, Video } from 'lucide-react';
import { calculateObsCrop } from '../geometry/obsCrop';
import { Rect } from '../geometry/math';

interface ObsPanelProps {
  recordingRect: Rect;
  viewport: { width: number; height: number };
  isOpen: boolean;
  onClose: () => void;
}

export const ObsPanel: React.FC<ObsPanelProps> = ({
  recordingRect,
  viewport,
  isOpen,
  onClose,
}) => {
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const dpr = window.devicePixelRatio || 1;
  const crop = calculateObsCrop(recordingRect, viewport, dpr);

  const copyText = (text: string, fieldName?: string) => {
    navigator.clipboard.writeText(text);
    if (fieldName) {
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 1500);
    } else {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    }
  };

  const copySummary = () => {
    const text = `OBS Recortar/Preencher:
Esquerda (Left): ${crop.left}
Topo (Top): ${crop.top}
Direita (Right): ${crop.right}
Baixo/Base (Bottom): ${crop.bottom}
Resolução resultante: ${crop.outputWidth}x${crop.outputHeight}`;
    copyText(text);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 520,
          maxWidth: '92vw',
          background: '#15171e',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7)',
          padding: 24,
          color: '#f1f5f9',
          fontFamily: 'inherit',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'rgba(239, 68, 68, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ef4444',
              }}
            >
              <Video size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>
                Configuração para OBS Studio
              </h2>
              <p style={{ fontSize: 12, color: '#94a3b8', margin: 0, marginTop: 2 }}>
                Valores exatos de corte para gravar apenas a área selecionada
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            data-testid="close-obs"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: 4,
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* DPI Warning if applicable */}
        <div
          style={{
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            borderRadius: 8,
            padding: '8px 12px',
            fontSize: 12,
            color: '#cbd5e1',
            marginBottom: 16,
          }}
        >
          <strong>Escala de Tela Detectada:</strong> {Math.round(dpr * 100)}% (DPR {dpr}).
          Os valores abaixo já foram compensados automaticamente.
        </div>

        {/* Crop Values Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 10,
            marginBottom: 16,
          }}
        >
          {[
            { label: 'Esquerda (Left)', val: crop.left, key: 'left' },
            { label: 'Topo (Top)', val: crop.top, key: 'top' },
            { label: 'Direita (Right)', val: crop.right, key: 'right' },
            { label: 'Base / Baixo (Bottom)', val: crop.bottom, key: 'bottom' },
          ].map((item) => (
            <div
              key={item.key}
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 8,
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>{item.label}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#ffffff' }}>
                  {item.val} px
                </div>
              </div>
              <button
                onClick={() => copyText(item.val.toString(), item.key)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  borderRadius: 6,
                  color: copiedField === item.key ? '#4ade80' : '#cbd5e1',
                  padding: '6px 8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 11,
                }}
              >
                {copiedField === item.key ? <Check size={13} /> : <Copy size={13} />}
                {copiedField === item.key ? 'Copiado' : 'Copiar'}
              </button>
            </div>
          ))}
        </div>

        {/* Summary output dimensions */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: 8,
            marginBottom: 18,
          }}
        >
          <div>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>Resolução Final no Vídeo: </span>
            <strong style={{ fontSize: 14, color: '#f87171' }}>
              {crop.outputWidth} × {crop.outputHeight} px
            </strong>
          </div>
          <button
            onClick={copySummary}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: '#ef4444',
              color: '#ffffff',
              border: 'none',
              borderRadius: 6,
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {copiedAll ? <Check size={14} /> : <Copy size={14} />}
            {copiedAll ? 'Tudo Copiado!' : 'Copiar Todos os Valores'}
          </button>
        </div>

        {/* Instructions */}
        <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>
          <strong style={{ color: '#e2e8f0', display: 'block', marginBottom: 6 }}>
            Como aplicar no OBS Studio:
          </strong>
          <ol style={{ paddingLeft: 18, margin: 0 }}>
            <li>No OBS, adicione a fonte <strong>Captura de Janela</strong> selecionando esta janela (ou Captura de Tela com <code>F11</code>).</li>
            <li>Marque <strong>"Capturar Cursor"</strong> para que seu mouse apareça arrastando itens ao vivo.</li>
            <li>Clique com botão direito na fonte &gt; <strong>Filtros</strong> &gt; adicione <strong>Recortar/Preencher</strong>.</li>
            <li>Digite os números de Esquerda, Topo, Direita e Baixo exibidos acima.</li>
            <li>Pronto! Apenas o interior da caixa será gravado. Você pode arrastar imagens de fora da área para dentro do vídeo livremente.</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
