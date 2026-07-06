import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file and merge with system environment variables (Docker)
  const env = { ...process.env, ...loadEnv(mode, process.cwd()) }
  const serverDomain = env.VITE_SERVER_DOMAIN || 'lims.local'

  return {
    plugins: [
      react(),
      {
        name: 'request-logger',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (env.VITE_ENABLE_TERMINAL_LOG === "true") {
              const now = new Date().toLocaleString();
              const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
              // Clean up IPv6 prefix if present (e.g. ::ffff:192.168.1.1)
              const cleanIp = ip.includes('::ffff:') ? ip.split('::ffff:')[1] : ip;
              console.log(`[${now}] [IP: ${cleanIp}] ${req.method} ${req.url}`);
            }
            next();
          });
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/views/components'),
        '@pages': path.resolve(__dirname, './src/views/pages'),
        '@models': path.resolve(__dirname, './src/models'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@context': path.resolve(__dirname, './src/context'),
        '@controllers': path.resolve(__dirname, './src/controllers'),
        '@assets': path.resolve(__dirname, './src/assets'),
        '@layout': path.resolve(__dirname, './src/views/layout'),
        '@constants': path.resolve(__dirname, './src/constants'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: parseInt(env.VITE_PORT) || 5173,
      https: env.VITE_SSL_CERT_PATH && env.VITE_SSL_KEY_PATH && 
             fs.existsSync(path.resolve(env.VITE_SSL_CERT_PATH)) && 
             fs.existsSync(path.resolve(env.VITE_SSL_KEY_PATH)) 
             ? {
                 key: fs.readFileSync(path.resolve(env.VITE_SSL_KEY_PATH)),
                 cert: fs.readFileSync(path.resolve(env.VITE_SSL_CERT_PATH)),
               } 
             : false,
      allowedHosts: true,
        proxy: {
        '/api': {
          target: env.VITE_PROXY_TARGET || 'http://127.0.0.1:8081',
          changeOrigin: true,
          secure: false,
          xfwd: true,
          headers: {
            Host: env.VITE_SERVER_DOMAIN || 'lims.local'
          }
        },
      },
      // Security headers — konsisten dengan Go backend middleware (security_headers.go)
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
        'Content-Security-Policy':
          "default-src 'self'; " +
          "script-src 'self' 'unsafe-inline'; " +
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; " +
          "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com data:; " +
          "img-src 'self' data: blob:; " +
          "connect-src 'self'; " +
          "frame-src 'self' blob:; " +
          "object-src 'none'; " +
          "base-uri 'self'",
      },
    },
  }
})
