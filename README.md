# Llama Full Stack - React, FastAPI

**Llama Full Stack** is a React-based app that let you comunicate with llama backedn through fastAPI

<!-- ## Theme Demo ![Screenshot of Box Crafter](./src/assets/) -->

<!-- 🌐 **Live Demo:** [Box Crafter on Netlify](https://box-crafter.netlify.app) -->

## 🚀 Getting Started

1. **Clone and Install**
   ```bash
   git clone https://https://github.com/rekcoob/llama_full_stack
   ```
2. **Run Locally**

   ```bash
   docker compose up --build
   ```

   Visit `http://localhost:3000`

3. **Prometheus & Grafana Setup**
   Grafana Url to connect to Prometheus between Docker containers in this setup:
   http://prometheus:9090

### Chat with CLI (Without Frontend)

docker exec -it citadel-ollama-1 ollama run llama3
