# Manual Setup Guide

This guide will help you to setup the project manually.

## Requirements

- Please make sure that the base requirements are met. See [Requirements](../README.md#requirements) for more information.
- [Node.js](https://nodejs.org/en/) (>= 18.18.0)
- [Yarn](https://classic.yarnpkg.com/lang/en/docs/install) (>= 1.22.19)
- [PostgreSQL](https://www.postgresql.org/) (>= 14)
- [Redis](https://redis.io/) (>= 6.2.5)

You can also setup manually Docker containers for [PostgreSQL](https://hub.docker.com/_/postgres) and [Redis](https://hub.docker.com/_/redis).

## Installation

Using your terminal, clone this repository on your local machine using Git:

```bash
git clone https://github.com/luizfelipelaviola/autodroid.git
```

Navigate to the repository folder:

```bash
cd autodroid
```

Install the dependencies:

```bash
yarn install
```

## Configuration

Once you have filled the requirements and installed the dependencies, you can proceed with the configuration.

### Environment Variables

Create a `.env` file in the root of the project and copy the content from the `.env.example` file. Then, fill the environment variables with your own values.

### Database

Please make sure that your PostgreSQL server is running.
Use the command below to create and migrate the database:

```bash
yarn prisma migrate dev
```

### Redis

Please make sure that your Redis server is running.
No additional configuration is required for Redis.

## Running

Once you have filled the requirements, installed the dependencies and configured the project, you can proceed with the execution.

To run the project in development mode, use the command below:

```bash
yarn dev
```

Follow the [Usage](../README.md#usage) instructions to use the project.

## Deployment

To deploy the project manually (without Docker), you need to build the backend separately.

### Backend

Navigate to the backend folder:

```bash
cd ./packages/backend
```

To build this backend for production, use the command below:

```bash
yarn build
```

This build outputs just JavaScript files that can be executed by Node.js.

Setup Node.js, Yarn, PostgreSQL and Redis on your server.

Navigate to the previously selected folder to host the project.

Transfer the `package.json` and `yarn.lock` files to the folder.

Transfer the `dist` and `prisma` folders to the same folder where the `package.json` file is located.

Install the dependencies on your server:

```bash
yarn install --production
```

Fill the production environment variables in the `.env` file, you can use the file `.env.example` as a reference filling with your own values, including your PostgreSQL and Redis credentials.

Run the project:

```bash
yarn start
```

The project will be available at the port specified in the `.env` file, by default it is `3333`.

Please make sure that your web server is very well configured and secure, including firewall, SSL, etc.