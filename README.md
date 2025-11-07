# PDF Extraction System - Frontend

Sistema moderno e minimalista para extração estruturada de dados de PDFs utilizando IA.

## 🚀 Tecnologias

- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização moderna
- **Framer Motion** - Animações fluidas
- **Lucide React** - Ícones modernos

## 🎨 Características

- ✨ Design minimalista e futurista
- 🎭 Tema claro com gradientes suaves
- 📱 Totalmente responsivo
- 🚀 Performance otimizada
- 🔄 Upload múltiplo de PDFs
- ⚙️ Configuração de schemas personalizados
- 📊 Visualização de resultados em tempo real
- 💾 Download de resultados em JSON

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Copiar arquivo de ambiente
cp .env.local.example .env.local

# Editar .env.local com a URL da API
# NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🏃 Executar

```bash
# Modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar produção
npm start
```

A aplicação estará disponível em `http://localhost:3000`

## 🔧 Configuração da API

Por padrão, a aplicação espera que o backend esteja rodando em `http://localhost:8000`.

Para alterar, edite o arquivo `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://seu-backend:porta
```

## 📖 Como Usar

### Opção 1: Com Dataset (Automático) ⚡

1. **Carregar Dataset**: Faça upload de um arquivo JSON com as configurações
2. **Upload de PDFs**: Arraste ou selecione arquivos PDF
3. **Auto-configuração**: Os PDFs são configurados automaticamente baseado no dataset
4. **Processar**: Clique em "Processar Todos"
5. **Resultados**: Visualize e baixe os dados extraídos

### Opção 2: Manual 🔧

1. **Upload de PDFs**: Arraste ou selecione arquivos PDF
2. **Configurar**: Clique em configurar para cada PDF e defina:
   - Label do documento (ex: `carteira_oab`, `tela_sistema`)
   - Schema de extração (campos e descrições)
3. **Processar**: Clique em "Processar Todos" para enviar para a API
4. **Resultados**: Visualize os dados extraídos em tempo real
5. **Download**: Baixe todos os resultados em formato JSON

> 💡 **Dica**: Use datasets para processar múltiplos PDFs de forma automática! Veja `DATASET_GUIDE.md` para detalhes.

## 🎯 Templates e Dataset

### Templates Pré-definidos

A aplicação inclui templates para:

- **carteira_oab**: Carteiras da OAB
- **tela_sistema**: Telas de sistemas diversos

Você pode usar esses templates ou criar schemas personalizados.

### Dataset de Configuração

O dataset permite configurar automaticamente múltiplos PDFs de uma vez:

```json
[
  {
    "label": "carteira_oab",
    "extraction_schema": { "nome": "...", "inscricao": "..." },
    "pdf_path": "oab_1.pdf"
  }
]
```

- Veja o exemplo em: `public/example-dataset.json`
- Documentação completa: `DATASET_GUIDE.md`

## 🏗️ Estrutura do Projeto

```
/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Página inicial
│   └── globals.css        # Estilos globais
├── components/            # Componentes React
│   ├── FileUpload.tsx     # Upload de arquivos
│   ├── PDFCard.tsx        # Card de PDF
│   ├── SchemaEditor.tsx   # Editor de schemas
│   └── ResultsDisplay.tsx # Exibição de resultados
├── lib/                   # Utilitários
│   ├── api.ts            # Cliente API
│   ├── utils.ts          # Funções auxiliares
│   └── templates.ts      # Templates pré-definidos
├── types/                # TypeScript types
│   └── index.ts          # Tipos da aplicação
└── public/               # Arquivos estáticos
```

## 🎨 Customização

### Cores

Edite `tailwind.config.ts` para personalizar as cores:

```ts
colors: {
  primary: { ... },
  accent: { ... }
}
```

### Animações

As animações são configuradas em `app/globals.css` e utilizam Framer Motion nos componentes.

## 📝 API

A aplicação consome os seguintes endpoints:

- `POST /extract` - Extrai dados de um PDF
  - `file`: PDF (multipart/form-data)
  - `label`: String
  - `extraction_schema`: JSON string

- `GET /health` - Status da API

- `GET /stats` - Estatísticas

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

## 📄 Licença

Este projeto está sob a licença MIT.
