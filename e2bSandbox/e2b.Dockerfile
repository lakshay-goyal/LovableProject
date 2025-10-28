FROM e2bdev/code-interpreter:latest

WORKDIR /home/user

# Create Vite React project and install dependencies
RUN npm create vite@latest . -- --template react && \
    npm install && \
    npm install tailwindcss @tailwindcss/vite

# Create vite.config.ts with Tailwind plugin and allowedHosts
RUN echo "import { defineConfig } from 'vite';\n\
import react from '@vitejs/plugin-react';\n\
import tailwindcss from '@tailwindcss/vite';\n\n\

export default defineConfig({\n\
  plugins: [react(), tailwindcss()],\n\
  server: {\n\
    allowedHosts: true,\n\
  },\n\
});" > vite.config.js

# Replace contents of src/index.css with Tailwind import
RUN echo '@import "tailwindcss";' > src/index.css