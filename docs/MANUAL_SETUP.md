# Manual Setup Guide

Este guia irá ajudá-lo a configurar o projeto manualmente.

## Requisitos

- Certifique-se de que os requisitos básicos sejam atendidos. Consulte [Requisitos](../README.md#requisitos) para mais informações.
- [Node.js](https://nodejs.org/en/) (>= 18.18.0)
- [Yarn](https://classic.yarnpkg.com/lang/en/docs/install) (>= 1.22.19)
- [PostgreSQL](https://www.postgresql.org/) (>= 14)
- [Redis](https://redis.io/) (>= 6.2.5)

Você também pode configurar manualmente contêineres Docker para [PostgreSQL](https://hub.docker.com/_/postgres) e [Redis](https://hub.docker.com/_/redis).

## Instalação

Usando o terminal, clone este repositório em sua máquina local usando o Git:

```bash
git clone https://github.com/luizfelipelaviola/autodroid.git
```

Navegue até a pasta do repositório:

```bash
cd autodroid
```

Instale as dependências:

```bash
yarn install
```

## Configuração

Depois de preencher os requisitos e instalar as dependências, você pode prosseguir com a configuração.

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto e copie o conteúdo do arquivo `.env.example`. Em seguida, preencha as variáveis de ambiente com seus próprios valores.

### Banco de Dados

Certifique-se de que seu servidor PostgreSQL esteja em execução.
Use o comando abaixo para criar e migrar o banco de dados:

```bash
yarn prisma migrate dev
```

### Redis

Certifique-se de que seu servidor Redis esteja em execução.
Nenhuma configuração adicional é necessária para o Redis.

## Execução

Depois de preencher os requisitos, instalar as dependências e configurar o projeto, você pode prosseguir com a execução.

Para executar o projeto em modo de desenvolvimento, use o comando abaixo:

```bash
yarn dev
```

Siga as instruções de [Uso](../README.md#uso) para utilizar o projeto.

## Implantação

Para implantar o projeto manualmente (sem Docker), você precisa construir o backend separadamente.

### Backend

Navegue até a pasta do backend:

```bash
cd ./packages/backend
```

Para construir este backend para produção, use o comando abaixo:

```bash
yarn build
```

Esta construção gera apenas arquivos JavaScript que podem ser executados pelo Node.js.

Configure o Node.js, Yarn, PostgreSQL e Redis em seu servidor.

Navegue até a pasta previamente selecionada para hospedar o projeto.

Transfira os arquivos `package.json` e `yarn.lock` para a pasta.

Transfira as pastas `dist` e `prisma` para a mesma pasta onde o arquivo `package.json` está localizado.

Instale as dependências em seu servidor:

```bash
yarn install --production
```

Preencha as variáveis de ambiente de produção no arquivo `.env`, você pode usar o arquivo `.env.example` como referência, preenchendo com seus próprios valores, incluindo suas credenciais do PostgreSQL e Redis.

Execute o projeto:

```bash
yarn start
```

O projeto estará disponível na porta especificada no arquivo `.env`, por padrão é `3333`.

Certifique-se de que seu servidor web esteja bem configurado e seguro, incluindo firewall, SSL, etc.