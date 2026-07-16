FROM node:22-alpine AS build
ARG SITE_PUBLIC_URL=http://localhost:5173
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN node scripts/generate-runtime-config.js
RUN SITE_PUBLIC_URL=${SITE_PUBLIC_URL} npm run build

FROM nginx:1.29-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
COPY docker/generate-runtime-config.sh /docker-entrypoint.d/generate-runtime-config.sh
RUN chmod +x /docker-entrypoint.d/generate-runtime-config.sh
EXPOSE 80