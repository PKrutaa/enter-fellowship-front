# PDF Extraction System - Frontend

Modern and minimalist system for structured data extraction from PDFs using AI.

## 🚀 Technologies

- **Next.js 14** - React Framework with App Router
- **TypeScript** - Static typing
- **Tailwind CSS** - Modern styling
- **Framer Motion** - Fluid animations
- **Lucide React** - Modern icons

## 🎨 Features

- ✨ Minimalist and futuristic design
- 🎭 Light theme with smooth gradients
- 📱 Fully responsive
- 🚀 Optimized performance
- 🔄 Multiple PDF upload
- ⚙️ Custom schema configuration
- 📊 Real-time results visualization
- 💾 Download results in JSON

## 📦 Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.local.example .env.local

# Edit .env.local with the API URL
# NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🏃 Run

```bash
# Development mode
npm run dev

# Production build
npm run build

# Run production
npm start
```

The application will be available at `http://localhost:3000`

## 🔧 API Configuration

By default, the application expects the backend to be running at `http://localhost:8000`.

To change it, edit the `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://your-backend:port
```

## 📖 How to Use

### Option 1: With Dataset (Automatic) ⚡

1. **Load Dataset**: Upload a JSON file with the configurations
2. **Upload PDFs**: Drag or select PDF files
3. **Auto-configuration**: PDFs are automatically configured based on the dataset
4. **Process**: Click "Process All"
5. **Results**: View and download the extracted data

### Option 2: Manual 🔧

1. **Upload PDFs**: Drag or select PDF files
2. **Configure**: Click configure for each PDF and define:
   - Document label (e.g., `carteira_oab`, `tela_sistema`)
   - Extraction schema (fields and descriptions)
3. **Process**: Click "Process All" to send to the API
4. **Results**: View extracted data in real-time
5. **Download**: Download all results in JSON format

> 💡 **Tip**: Use datasets to process multiple PDFs automatically! See `DATASET_GUIDE.md` for details.

## 🎯 Templates and Dataset

### Pre-defined Templates

The application includes templates for:

- **carteira_oab**: OAB identity cards
- **tela_sistema**: Various system screens

You can use these templates or create custom schemas.

### Configuration Dataset

The dataset allows you to automatically configure multiple PDFs at once:

```json
[
  {
    "label": "carteira_oab",
    "extraction_schema": { "nome": "...", "inscricao": "..." },
    "pdf_path": "oab_1.pdf"
  }
]
```

- See the example at: `public/example-dataset.json`
- Full documentation: `DATASET_GUIDE.md`

## 🏗️ Project Structure

```
/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Main layout
│   ├── page.tsx           # Initial page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── FileUpload.tsx     # File upload
│   ├── PDFCard.tsx        # PDF card
│   ├── SchemaEditor.tsx   # Schema editor
│   └── ResultsDisplay.tsx # Results display
├── lib/                   # Utilities
│   ├── api.ts            # API client
│   ├── utils.ts          # Auxiliary functions
│   └── templates.ts      # Pre-defined templates
├── types/                # TypeScript types
│   └── index.ts          # Application types
└── public/               # Static files
```

## 🎨 Customization

### Colors

Edit `tailwind.config.ts` to customize the colors:

```ts
colors: {
  primary: { ... },
  accent: { ... }
}
```

### Animations

Animations are configured in `app/globals.css` and use Framer Motion in the components.

## 📝 API

The application consumes the following endpoints:

- `POST /extract` - Extracts data from a PDF
  - `file`: PDF (multipart/form-data)
  - `label`: String
  - `extraction_schema`: JSON string

- `GET /health` - API status

- `GET /stats` - Statistics

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or pull requests.

## 📄 License

This project is under the MIT license.
