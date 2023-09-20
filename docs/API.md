# API Routes

The following table shows the available routes in the API.

| Method | Route | Description |
| --- | --- | --- |
| GET | /processor | Get all processors |
| GET | /processor/:id | Get a processor by id |
| POST (json) | /user/register | Register a new user |
| GET | /user/:id | Get a user by id |
| POST (multipart/form-data) | /dataset | Upload a dataset |
| GET | /dataset | Get all datasets |
| GET | /dataset/:id | Get a dataset by id |
| GET | /dataset/:id/download | Download a dataset by id |
| PUT (json) | /dataset/:id | Update a dataset by id |
| DELETE | /dataset/:id | Delete a dataset by id |
| POST (json) | /processing | Request a dataset processing |
| GET | /processing | Get all processing |
| GET | /processing/:id | Get a processing by id |
| GET | /processing/:id/download/:path | Download a processing file by id and its path |
| DELETE | /processing/:id | Delete a processing by id with all files |

The following commands describes some examples on how to use the API with curl.

## Processor

### Get all processors

```bash
curl --request GET \
  --url http://localhost:3333/processor
```

### Get a processor by id

```bash
curl --request GET \
  --url http://localhost:3333/processor/droidaugmentor
```

## User

### Register a new user

```bash
curl --request POST \
  --url http://localhost:3333/user/register
```

### Get a user by id

```bash
curl --request GET \
  --url http://localhost:3333/user/<<id>>
```

Replace `<<id>>` with the user id.

## Dataset

### Create/Upload a dataset

```bash
curl --request POST \
  --url http://localhost:3333/dataset \
  --header 'Authorization: Bearer <<user_id>>' \
  --header 'Content-Type: multipart/form-data' \
  --form 'dataset=@<<file>>' \
  --form 'description=<<description>>'
```

Replace `<<user_id>>` with the user id and `<<file>>` with the dataset file.

Replace `<<description>>` with the dataset description.

### Get all datasets

```bash
curl --request GET \
  --url http://localhost:3333/dataset \
  --header 'Authorization: Bearer <<user_id>>'
```

### Get a dataset by id

```bash
curl --request GET \
  --url http://localhost:3333/dataset/<<dataset_id>> \
  --header 'Authorization: Bearer <<user_id>>'
```

Replace `<<dataset_id>>` with the dataset id and `<<user_id>>` with the user id.

### Download a dataset by id

```bash
curl --request GET \
  --url http://localhost:3333/dataset/<<dataset_id>/download \
  --header 'Authorization: Bearer <<user_id>>'
```

Replace `<<dataset_id>>` with the dataset id and `<<user_id>>` with the user id.

### Update a dataset by id

```bash
curl --request PUT \
  --url http://localhost:3333/dataset/<<dataset_id>> \
  --header 'Authorization: Bearer <<user_id>>' \
  --header 'Content-Type: application/json' \
  --data '{
	"description": "<<description>>"
}'
```

Replace `<<dataset_id>>` with the dataset id, `<<user_id>>` with the user id and `<<description>>` with the new description.

### Delete a dataset by id

```bash
curl --request DELETE \
  --url http://localhost:3333/dataset/<<dataset_id>> \
  --header 'Authorization: Bearer <<user_id>>'
```

Replace `<<dataset_id>>` with the dataset id and `<<user_id>>` with the user id.

## Processing

### Request a dataset processing

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

Replace `<<dataset_id>>` with the dataset id and `<<user_id>>` with the user id.

Run the "Get all processors" command to get the available processors and its available parameters.

Replace the "processor" value with the selected processor.

Fill the "params" object with the available processor parameters.

### Get all processing

```bash
curl --request GET \
  --url http://localhost:3333/processing \
  --header 'Authorization: Bearer <<user_id>>'
```

Replace `<<user_id>>` with the user id.

### Get a processing by id

```bash
curl --request GET \
  --url http://localhost:3333/processing/<<processing_id>> \
  --header 'Authorization: Bearer <<user_id>>'
```

Replace `<<processing_id>>` with the processing id and `<<user_id>>` with the user id.

### Download a processing file by id and its path

```bash
curl --request GET \
  --url http://localhost:3333/processing/<<processing_id>>/download/<<file_path>> \
  --header 'Authorization: Bearer <<user_id>>'
```

Replace `<<processing_id>>` with the processing id and `<<user_id>>` with the user id.

Run the "Get a processing by id" command to get the available files.

The path after `/download/` is the file path. Replace `<<file_path>>` with the desired file path. It can also be a directory or nested files and directories.

Each file needs to be downloaded individually.

### Delete a processing by id with all files

```bash
curl --request DELETE \
  --url http://localhost:3333/processing/<<processing_id>> \
  --header 'Authorization: Bearer <<user_id>>'
```

Replace `<<processing_id>>` with the processing id and `<<user_id>>` with the user id.