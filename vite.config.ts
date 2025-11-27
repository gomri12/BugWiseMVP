import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // IMPORTANT: Replace <REPO_NAME> with your GitHub repository name
  // e.g. if your repo is 'bugwise-poc', this should be '/bugwise-poc/'
  base: '/BugWiseMVP/', 
})