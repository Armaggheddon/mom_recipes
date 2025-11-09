# build environment
FROM node:25-alpine AS build
WORKDIR /app
COPY ./frontend/package.json frontend/package-lock.json ./
COPY ./frontend/tsconfig.json ./
RUN npm install
COPY ./frontend/ ./
RUN npm run build

# production environment
FROM nginx:1.29.2-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
