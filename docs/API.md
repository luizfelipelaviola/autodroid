# Rotas da API

A tabela a seguir mostra as rotas disponíveis na API.

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | /processor | Obter todos os processadores |
| GET | /processor/:id | Obter um processador pelo ID |
| POST (json) | /user/register | Registrar um novo usuário |
| GET | /user/:id | Obter um usuário pelo ID |
| POST (multipart/form-data) | /dataset | Enviar um conjunto de dados |
| GET | /dataset | Obter todos os conjuntos de dados |
| GET | /dataset/:id | Obter um conjunto de dados pelo ID |
| GET | /dataset/:id/download | Baixar um conjunto de dados pelo ID |
| PUT (json) | /dataset/:id | Atualizar um conjunto de dados pelo ID |
| DELETE | /dataset/:id | Excluir um conjunto de dados pelo ID |
| POST (json) | /processing | Solicitar o processamento de um conjunto de dados |
| GET | /processing | Obter todos os processamentos |
| GET | /processing/:id | Obter um processamento pelo ID |
| GET | /processing/:id/download/:path | Baixar um arquivo de processamento pelo ID e caminho |
| DELETE | /processing/:id | Excluir um processamento pelo ID com todos os arquivos |

Os seguintes comandos descrevem alguns exemplos de como usar a API com o curl.

## Processador

### Obter todos os processadores

```bash
curl --request GET \
  --url http://localhost:3333/processor
```

### Obter um processador pelo ID

```bash
curl --request GET \
  --url http://localhost:3333/processor/droidaugmentor
```

## Usuário

### Registrar um novo usuário

```bash
curl --request POST \
  --url http://localhost:3333/user/register
```

### Obter um usuário pelo ID

```bash
curl --request GET \
  --url http://localhost:3333/user/<<id>>
```

Substitua `<<id>>` pelo ID do usuário.

## Conjunto de Dados

### Criar/Enviar um conjunto de dados

```bash
curl --request POST \
  --url http://localhost:3333/dataset \
  --header 'Authorization: Bearer <<user_id>>' \
  --header 'Content-Type: multipart/form-data' \
  --form 'dataset=@<<file>>' \
  --form 'description=<<description>>'
```

Substitua `<<user_id>>` pelo ID do usuário e `<<file>>` pelo arquivo do conjunto de dados.

Substitua `<<description>>` pela descrição do conjunto de dados.

### Obter todos os conjuntos de dados

```bash
curl --request GET \
  --url http://localhost:3333/dataset \
  --header 'Authorization: Bearer <<user_id>>'
```

### Obter um conjunto de dados pelo ID

```bash
curl --request GET \
  --url http://localhost:3333/dataset/<<dataset_id>> \
  --header 'Authorization: Bearer <<user_id>>'
```

Substitua `<<dataset_id>>` pelo ID do conjunto de dados e `<<user_id>>` pelo ID do usuário.

### Baixar um conjunto de dados pelo ID

```bash
curl --request GET \
  --url http://localhost:3333/dataset/<<dataset_id>/download \
  --header 'Authorization: Bearer <<user_id>>'
```

Substitua `<<dataset_id>>` pelo ID do conjunto de dados e `<<user_id>>` pelo ID do usuário.

### Atualizar um conjunto de dados pelo ID

```bash
curl --request PUT \
  --url http://localhost:3333/dataset/<<dataset_id>> \
  --header 'Authorization: Bearer <<user_id>>' \
  --header 'Content-Type: application/json' \
  --data '{
  "description": "<<description>>"
}'
```

Substitua `<<dataset_id>>` pelo ID do conjunto de dados, `<<user_id>>` pelo ID do usuário e `<<description>>` pela nova descrição.

### Excluir um conjunto de dados pelo ID

```bash
curl --request DELETE \
  --url http://localhost:3333/dataset/<<dataset_id>> \
  --header 'Authorization: Bearer <<user_id>>'
```

Substitua `<<dataset_id>>` pelo ID do conjunto de dados e `<<user_id>>` pelo ID do usuário.

## Processamento

### Solicitar o processamento de um conjunto de dados

```bash
curl --request POST \
  --url http://localhost:3333/processing \
  --header 'Authorization: Bearer <<user_id>>' \
  --header 'Content-Type: application/json' \
  --data '{
  "dataset_id": "<<dataset_id>>",
  "processor": "droidaugmentor",
  "params": {
    "verbosity": "20",
    "dense_layer_sizes_g": "256",
    "dense_layer_sizes_d": "256",
    "number_epochs": "1000",
    "training_algorithm": "Adam"
  }
}'
```

Substitua `<<dataset_id>>` pelo ID do conjunto de dados e `<<user_id>>` pelo ID do usuário.

Execute o comando "Obter todos os processadores" para obter os processadores disponíveis e seus parâmetros disponíveis.

Substitua o valor "processor" pelo processador selecionado.

Preencha o objeto "params" com os parâmetros disponíveis do processador.

### Obter todos os processamentos

```bash
curl --request GET \
  --url http://localhost:3333/processing \
  --header 'Authorization: Bearer <<user_id>>'
```

Substitua `<<user_id>>` pelo ID do usuário.

### Obter um processamento pelo ID

```bash
curl --request GET \
  --url http://localhost:3333/processing/<<processing_id>> \
  --header 'Authorization: Bearer <<user_id>>'
```

Substitua `<<processing_id>>` pelo ID do processamento e `<<user_id>>` pelo ID do usuário.

### Baixar um arquivo de processamento pelo ID e caminho

```bash
curl --request GET \
  --url http://localhost:3333/processing/<<processing_id>>/download/<<file_path>> \
  --header 'Authorization: Bearer <<user_id>>'
```

Substitua `<<processing_id>>` pelo ID do processamento e `<<user_id>>` pelo ID do usuário.

Execute o comando "Obter um processamento pelo ID" para obter os arquivos disponíveis.

O caminho após `/download/` é o caminho do arquivo. Substitua `<<file_path>>` pelo caminho do arquivo desejado. Também pode ser um diretório ou arquivos e diretórios aninhados.

Cada arquivo precisa ser baixado individualmente.

### Excluir um processamento pelo ID com todos os arquivos

```bash
curl --request DELETE \
  --url http://localhost:3333/processing/<<processing_id>> \
  --header 'Authorization: Bearer <<user_id>>'
```

Substitua `<<processing_id>>` pelo ID do processamento e `<<user_id>>` pelo ID do usuário.