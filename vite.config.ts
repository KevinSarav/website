import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(() => {
  const configuredBase = (process.env.VITE_BASE_PATH ?? '').trim()
  const base = configuredBase.length > 0 ? configuredBase : '/'

  return {
    plugins: [react()],
    base,
  }
})