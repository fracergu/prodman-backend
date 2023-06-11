# Prodman Backend

## Under Development

### Requirements

- [Docker](https://docs.docker.com/get-docker/)
- [Node.js](https://nodejs.org/en/download/)

### Database

To create the database, run the following command:

```bash
docker run -d -p 5432:5432 --name prodman-db -e POSTGRES_USER=user -e POSTGRES_PASSWORD=secret -e POSTGRES_DB=prodman_db postgres
```

### Installation

To install the dependencies, run the following command:

```bash
npm install
```

You must generate the Prisma client, run the following command:

```bash
npx prisma generate
```

Also, you must apply the migrations, run the following command:

```bash
npx prisma migrate deploy
```
