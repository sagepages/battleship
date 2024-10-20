# Backend Dockerfile
FROM golang:1.20-alpine AS builder
WORKDIR /app
COPY . .
RUN CGO_ENABLED=0 go build -o battleship-server

FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/battleship-server .
EXPOSE 8080
CMD ["./battleship-server"]
