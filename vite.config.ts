import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import svgr from 'vite-plugin-svgr'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), svgr()],
  resolve: {
    alias: [{ find: '@', replacement: path.resolve(__dirname, 'src') }]
  },
  server: {
    host: true, // LAN 노출 (실기기 웹뷰 테스트: http://<맥IP>:5173)
    port: 5173,
    proxy: {
      // 웹 → modu BE (주차권 결제 API). 로컬 CORS 우회.
      '/api': {
        target: 'https://api-dev.modudev.cloud',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, '')
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
