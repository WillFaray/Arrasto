# Arrasto 🎨

**Arrasto** é um aplicativo de whiteboard moderno, rápido e intuitivo, projetado para manipulação livre de imagens em resolução total, gravação de vídeos interativos com o OBS Studio e alternância dinâmica entre modo de edição e modo de apresentação limpa (ação).

---

## ✨ Principais Recursos

- 🖼️ **Manipulação Livre de Imagens**: Mova, redimensione e gire imagens livremente num canvas infinito.
- 📋 **Ingestão Inteligente**:
  - Cole imagens diretamente da área de transferência (`Ctrl + V`).
  - Arraste e solte arquivos do Windows Explorer sobre a tela.
  - Seletor nativo para múltiplos arquivos.
  - Preserva transparência nativa mesmo ao copiar imagens de navegadores.
- 🔍 **Resolução Total Sempre (Zero Downscale)**:
  - Armazenamento dos arquivos originais em IndexedDB sem perda de qualidade.
  - Re-amostragem nítida em alta definição pelo motor do navegador ao aproximar com zoom.
  - Botão de **Tamanho Real 1:1** para visualização pixel-a-pixel.
- ✏️ **Dois Modos de Trabalho**:
  - **Modo Edição (`E`)**: Alças nos cantos e laterais, alça de rotação com snap em 15°, barra de contexto flutuante (camadas, bloqueio, duplicação, reset de rotação, exclusão e remoção de fundo branco).
  - **Modo Ação (`A`)**: Interface 100% limpa, sem alças ou contornos. Permite arrastar imagens e fazer seleção retangular em lote sem poluir a gravação. Imagens bloqueadas tornam-se transparentes ao clique, servindo como cenários perfeitos.
- ☀️/🌙 **Fundo Branco ou Preto (`B`)**:
  - Alterne instantaneamente entre fundo claro ou escuro.
  - Pontos e grade sutis adaptam-se ao contraste do fundo selecionado.
- ✨ **Remover Fundo Branco**:
  - Ferramenta com um clique na barra de ferramentas para converter fundos brancos residuais em transparência pura, com suporte a Desfazer (`Ctrl + Z`).
- 🖱️ **Cursores Personalizados**:
  - Ponteiro estético escuro com contorno branco e sombra suave.
  - Cursores de mão aberta e mão fechada para movimentação.
  - Cursores direcionais que giram dinamicamente acompanhando o ângulo da imagem.
- 🎥 **Área de Gravação para OBS Studio (`R`)**:
  - Retângulo fixo na tela com escurecimento ajustável ao redor.
  - Presets de proporção: **16:9**, **9:16**, **1:1**, **4:3** ou **Livre**.
  - Permite arrastar imagens de fora da área para dentro do enquadramento ao vivo.
  - Calculadora integrada dos valores exatos de corte para o filtro **Recortar/Preencher** do OBS Studio.
- 💾 **Persistência Automática**:
  - Auto-salvamento instantâneo via IndexedDB. Ao reabrir o navegador, todo o seu quadro volta exatamente como estava.
  - Histórico completo de Desfazer/Refazer (`Ctrl + Z` e `Ctrl + Y`).

---

## ⌨️ Atalhos de Teclado

| Tecla | Ação |
|---|---|
| `E` | Alternar para o modo **Edição** |
| `A` | Alternar para o modo **Ação** |
| `B` | Alternar entre fundo **Branco** e **Preto** |
| `Ctrl + V` | Colar imagem da área de transferência |
| `Ctrl + Z` | Desfazer última alteração |
| `Ctrl + Y` ou `Ctrl + Shift + Z` | Refazer alteração |
| `Ctrl + D` | Duplicar imagem(ns) selecionada(s) |
| `Delete` / `Backspace` | Remover imagem(ns) selecionada(s) |
| `L` | Bloquear / Desbloquear imagem(ns) |
| `]` | Avançar camada |
| `[` | Recuar camada |
| `Shift + ]` | Trazer para o topo |
| `Shift + [` | Enviar para o fundo |
| `R` | Ativar / Ajustar Área de Gravação do OBS |
| `Espaço + Arrastar` ou `Botão do Meio` | Mover a câmera (Pan) |
| `Roda do Mouse` | Zoom suave centrado no cursor |
| `Ctrl + 0` | Resetar zoom para 100% |
| `Shift + 1` | Enquadrar todas as imagens na tela |
| `Esc` | Limpar seleção / Fechar ajustes |

---

## 🎬 Como Usar com o OBS Studio

1. **Abra o Arrasto** no navegador e pressione `F11` para tela cheia.
2. Pressione **`R`** ou clique em **"Área OBS"** no topo para ajustar o enquadramento desejado (ex.: 16:9).
3. Clique em **"Crop OBS"** para abrir a janela com os valores calculados de corte:
   - **Esquerda (Left)**
   - **Topo (Top)**
   - **Direita (Right)**
   - **Base / Baixo (Bottom)**
4. No **OBS Studio**:
   - Adicione uma fonte de **Captura de Janela** (ou Captura de Tela) selecionando a janela do navegador.
   - Certifique-se de marcar a opção **"Capturar cursor"**.
   - Clique com botão direito na fonte > **Filtros** > adicione o filtro **Recortar/Preencher** (Crop/Pad).
   - Insira os valores calculados exibidos no Arrasto.
5. Pressione **`A`** no Arrasto para entrar no **Modo Ação**.
6. Pronto! Agora você pode gravar seu vídeo e arrastar imagens de fora da área para dentro do vídeo com visualização limpa e fluida.

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) versão 18 ou superior
- [npm](https://www.npmjs.com/)

### Instalação e Execução
```bash
# Clone o repositório
git clone https://github.com/WillFaray/Arrasto.git

# Acesse a pasta do projeto
cd Arrasto

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

Abra o endereço exibido no terminal (geralmente `http://localhost:5173/`) no Google Chrome ou Microsoft Edge.

### Comandos Disponíveis
- `npm run dev`: Inicia o servidor de desenvolvimento com hot-reload.
- `npm run build`: Valida tipos com TypeScript e compila os arquivos para produção em `dist/`.
- `npm run preview`: Executa a versão compilada de produção localmente.
- `npm run test`: Executa os testes automatizados com o Vitest.

---

## 🛠️ Tecnologias Utilizadas

- **React 19** com **TypeScript**
- **Vite** para build e bundling ultrarrápido
- **Zustand** para gerenciamento de estado global reativo
- **idb-keyval** para persistência assíncrona de Blobs e metadados no IndexedDB
- **Lucide React** para iconografia limpa e moderna
- **Vitest** e **Playwright** para testes unitários e testes end-to-end automatizados

---

## 📄 Licença
Distribuído sob licença privada. Desenvolvido para apresentações e criação de conteúdo interativo.
