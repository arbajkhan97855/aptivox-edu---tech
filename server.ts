import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import apiRouter from './backend/api.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // High payload limit for webcam base64 photo capture & question bank imports
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Request logger in dev
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.path}`);
    }
    next();
  });

  // Mount API Router
  app.use('/api', apiRouter);

  // Serve uploads or public files
  app.use('/uploads', express.static(path.resolve(__dirname, 'uploads')));

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(`APTIVOX EDUCATION & TECHNOLOGY - EXAMINATION SYSTEM`);
    console.log(`Server running at http://0.0.0.0:${PORT}`);
    console.log(`Admin Login Portal: http://0.0.0.0:${PORT}/APTIVOX/admin`);
    console.log(`====================================================`);
  });
}

startServer().catch((err) => {
  console.error('Fatal Server Error:', err);
  process.exit(1);
});
