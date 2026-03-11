# Build stage
FROM node:20 AS build

WORKDIR /app

# Enable corepack so the packageManager field (npm@11.x) in package.json is honoured
RUN corepack enable

COPY ai-frontend/package*.json ./
RUN npm install

COPY ai-frontend/ .

# Build browser-only static bundle (SSR disabled in angular.json)
RUN npm run build -- --configuration production

# Production stage
FROM nginx:alpine

COPY --from=build /app/dist/ai-frontend/browser /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]