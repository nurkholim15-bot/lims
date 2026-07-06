FROM golang:1.23-alpine

# Install git untuk dependency dan postgresql-client untuk pg_dump/psql
RUN apk add --no-cache git postgresql-client

WORKDIR /app

# Copy dependency files
COPY go.mod go.sum ./
RUN go mod download

# Copy seluruh source code
COPY . .

# Build aplikasi
RUN go build -o main .

# Port default yang digunakan aplikasi (akan di-override via env)
EXPOSE 8081

CMD ["./main"]
