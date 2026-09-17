# Stage 1: Build
FROM node:22-slim AS builder

WORKDIR /app

COPY package*.json ./

RUN rm -f package-lock.json \
 && npm install \
 && npm install @rolldown/binding-linux-arm64-gnu lightningcss-linux-arm64-gnu --no-save

COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]