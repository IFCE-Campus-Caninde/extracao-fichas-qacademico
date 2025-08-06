
# Extrator de Fotos de Fichas do Q-Acadêmico

Aplicação web para extrair fotos e legendas de fichas em PDF geradas pelo sistema Q-Acadêmico, desenvolvida para uso no IFCE - Campus Canindé. Todo o processamento é feito localmente no navegador, garantindo privacidade e segurança dos dados.

## Objetivo

Facilitar a extração em lote de fotos e legendas de fichas estudantis em PDF, permitindo o recorte automático das imagens e exportação em arquivos ZIP, sem necessidade de envio de dados para servidores externos.

## Funcionalidades

- Carregamento de arquivos PDF de fichas do Q-Acadêmico
- Configuração visual dos parâmetros de corte (margens, largura, altura, espaçamentos, área da legenda)
- Visualização e ajuste em tempo real dos cortes sobre as páginas do PDF
- Preview das imagens e legendas extraídas
- Processamento local das imagens e geração de arquivos ZIP para download
- Interface responsiva e suporte a modo escuro

## Tecnologias Utilizadas

- [Nuxt 3](https://nuxt.com/) (Vue 3)
- [PrimeVue](https://www.primefaces.org/primevue/) (componentes UI)
- [TailwindCSS](https://tailwindcss.com/) (estilização)
- [pdfjs-dist](https://github.com/mozilla/pdfjs-dist) (renderização de PDFs)
- TypeScript

## Como Usar

1. Instale as dependências:

   ```bash
   pnpm install
   # ou npm install, yarn install, conforme sua preferência
   ```

2. Inicie o servidor de desenvolvimento:

   ```bash
   pnpm dev
   # ou npm run dev, yarn dev
   ```

3. Acesse `http://localhost:3000` no navegador.

4. Siga as instruções na tela:
   - Carregue o PDF com as fichas
   - Ajuste os sliders para configurar os cortes das fotos e legendas
   - Visualize o preview
   - Clique em "Processar" e faça o download do arquivo ZIP gerado

## Estrutura do Projeto

- `app/pages/index.vue`: Página principal e fluxo do usuário
- `app/components/`: Componentes reutilizáveis (upload, preview, corte, download, etc.)
- `app/utils/`: Funções utilitárias e tipos TypeScript
- `nuxt.config.ts`: Configuração do Nuxt, PrimeVue e TailwindCSS

## Observações

- Nenhum dado é enviado para servidores externos. Todo o processamento ocorre no navegador do usuário.
- O projeto foi desenvolvido para atender demandas do IFCE - Campus Canindé, mas pode ser adaptado para outros contextos.

---
Feito com ❤️ por Carlos Alberto Castelo @ IFCE Campus Canindé
