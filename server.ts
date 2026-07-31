import express from 'express';
import path from 'path';
import { spawn } from 'child_process';
import http from 'http';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;
  const FASTAPI_PORT = 8000;

  // Spawn Python FastAPI server in background
  console.log('Starting Python FastAPI backend service...');
  const fastApiProcess = spawn('python3', ['-m', 'uvicorn', 'backend.app.main:app', '--host', '127.0.0.1', `--port=${FASTAPI_PORT}`], {
    stdio: 'inherit',
    env: { ...process.env, PYTHONPATH: process.cwd() },
  });

  fastApiProcess.on('error', (err) => {
    console.error('Failed to start FastAPI process:', err);
  });

  // Proxy function to forward HTTP requests to FastAPI
  const proxyToFastAPI = (req: express.Request, res: express.Response) => {
    const options: http.RequestOptions = {
      hostname: '127.0.0.1',
      port: FASTAPI_PORT,
      path: req.originalUrl,
      method: req.method,
      headers: {
        ...req.headers,
        host: `127.0.0.1:${FASTAPI_PORT}`,
      },
    };

    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });

    proxyReq.on('error', (err) => {
      console.error('Proxy request to FastAPI failed:', err.message);
      if (!res.headersSent) {
        res.status(502).json({
          error: 'FastAPI Backend service unavailable',
          message: 'The Python FastAPI backend is currently initializing. Please retry in a few seconds.',
        });
      }
    });

    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      req.pipe(proxyReq, { end: true });
    } else {
      proxyReq.end();
    }
  };

  // Route API and docs requests to FastAPI
  app.use('/api', proxyToFastAPI);
  app.use('/docs', proxyToFastAPI);
  app.use('/redoc', proxyToFastAPI);
  app.use('/openapi.json', proxyToFastAPI);

  // ==========================================
  // VITE & STATIC FILES SERVING
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Interview Intelligence System running on http://0.0.0.0:${PORT}`);
  });

  // Handle process shutdown
  process.on('SIGINT', () => {
    fastApiProcess.kill();
    process.exit();
  });
  process.on('SIGTERM', () => {
    fastApiProcess.kill();
    process.exit();
  });
}

startServer();
