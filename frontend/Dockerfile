# ─────────────────────────────────────────────────────────────────────────────
# File: frontend/Dockerfile
# Stage 1: Build the React app
# Stage 2: Serve with Nginx
# ─────────────────────────────────────────────────────────────────────────────

# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files first for layer caching
COPY package.json ./
RUN npm install --silent

# Copy source
COPY . .

ARG REACT_APP_API_URL=
ARG REACT_APP_NAME=UniAI Platform
ARG REACT_APP_DEMO_MODE=true
ARG REACT_APP_ENABLE_ODIA=true

ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_NAME=$REACT_APP_NAME
ENV REACT_APP_DEMO_MODE=$REACT_APP_DEMO_MODE
ENV REACT_APP_ENABLE_ODIA=$REACT_APP_ENABLE_ODIA

# Disable CI mode so build doesn't fail on warnings
ENV CI=false

RUN npm run build

# ── Stage 2: Serve ────────────────────────────────────────────────────────────
FROM nginx:1.25-alpine

COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
