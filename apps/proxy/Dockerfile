FROM node:18-slim

WORKDIR /app

# Install dependencies with pnpm
RUN corepack enable

# Files required by pnpm install
COPY package.json ./

RUN pnpm install --prod

# Copy source code
COPY ./src ./src
COPY ./deployment ./deployment
COPY tsconfig.json .

ENTRYPOINT ["pnpm", "run", "start"]






