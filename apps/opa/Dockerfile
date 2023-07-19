FROM golang:1.20.6-alpine as builder

WORKDIR /app

RUN apk --no-cache add ca-certificates git

# Fetch dependencies
COPY go.mod go.sum ./
RUN go mod download

COPY *.go ./

RUN CGO_ENABLED=0 go build -o ./opa

FROM alpine

WORKDIR /app

COPY --from=builder /app/opa .

RUN chmod 755 ./opa

EXPOSE 8181
CMD ["/app/opa", "run", "--server"]