# PDFMaster Backend

Backend API for PDFMaster - PDF conversion and manipulation tools.

## Features

- JPG to PDF conversion
- PDF to JPG extraction
- WORD to PDF conversion  
- PowerPoint to PDF conversion
- File upload handling with Multer
- CORS enabled for frontend integration

## Environment Variables

- `PORT` - Server port (default: 5001)
- `NODE_ENV` - Environment (development/production)
- `FRONTEND_URL` - Frontend application URL
- `ALLOWED_ORIGINS` - Comma-separated allowed CORS origins
- `FILE_SIZE_LIMIT` - Max file size (default: 50MB)
- `UPLOAD_LIMIT` - Max number of files (default: 20)

## API Endpoints

- `POST /api/convert/images-to-pdf` - Convert images to PDF
- `POST /api/pdf-to-jpg/pdf-to-jpg` - Convert PDF to JPG
- `POST /api/word-to-pdf/word-to-pdf` - Convert Word to PDF
- `POST /api/powerpoint-to-pdf/powerpoint-to-pdf` - Convert PowerPoint to PDF
- `GET /health` - Health check

## Deployment

### Railway
1. Connect GitHub repository
2. Set root directory to `backend`
3. Add environment variables
4. Deploy automatically

### Local Development
```bash
npm install
npm run dev