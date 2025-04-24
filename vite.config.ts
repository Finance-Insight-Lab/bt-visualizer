import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/bt-visualizer/',
  plugins: [react()],
  // define: {
  //   'process.env.NODE_ENV': '"production"',
  // },
  // build: {
  //   lib: {
  //     entry: 'src/index.ts',
  //     name: 'BtVisualizer',
  //     formats: ['iife'],
  //     fileName: 'bt-visualizer',
  //   },
  // },
})
