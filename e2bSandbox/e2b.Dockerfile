FROM e2bdev/code-interpreter:latest

WORKDIR /home/user

RUN npm create vite@latest . -- --template react && \
    npm install && \
    npm install tailwindcss @tailwindcss/vite

RUN echo "import { defineConfig } from 'vite';\n\
import react from '@vitejs/plugin-react';\n\
import tailwindcss from '@tailwindcss/vite';\n\n\
export default defineConfig({\n\
  plugins: [react(), tailwindcss()],\n\
  server: {\n\
    allowedHosts: true,\n\
  },\n\
});" > vite.config.js

RUN echo '@import "tailwindcss";' > src/index.css