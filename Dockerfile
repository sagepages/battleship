# Use a multi-stage build for a smaller final image
FROM --platform=linux/amd64 golang:1.20 AS backend-builder
WORKDIR /app/backend
COPY battleship-server/ .
RUN go mod download
RUN CGO_ENABLED=0 GOOS=linux go build -o main .

FROM --platform=linux/amd64 node:18 AS frontend-builder
WORKDIR /app/frontend
COPY battleship-ui/ .
RUN npm install
RUN npm run build

# Final stage
FROM --platform=linux/amd64 node:18-alpine
RUN apk add --no-cache util-linux

# Copy the built backend
COPY --from=backend-builder /app/backend/main /app/backend/main

# Copy the built frontend
COPY --from=frontend-builder /app/frontend/.next /app/frontend/.next
COPY --from=frontend-builder /app/frontend/package.json /app/frontend/package.json
COPY --from=frontend-builder /app/frontend/public /app/frontend/public

# Install production dependencies for frontend
WORKDIR /app/frontend
RUN npm install --only=production

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose ports
EXPOSE 3000
EXPOSE 8080

# Start both services
CMD ["sh", "-c", "/app/backend/main & npm start --prefix /app/frontend"]
