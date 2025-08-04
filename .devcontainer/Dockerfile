FROM mcr.microsoft.com/devcontainers/typescript-node:1-22-bookworm

# Instale as dependências do canvas
RUN apt-get update && apt-get install -y \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
 && rm -rf /var/lib/apt/lists/*