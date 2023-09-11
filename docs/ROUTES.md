# API Routes

| Method | Route | Description |
| --- | --- | --- |
| GET | /processor | Get all processors |
| GET | /processor/:id | Get a processor by id |
<br/>
| POST (json) | /user/register | Register a new user |
| GET | /user/:id | Get a user by id |
<br/>
| POST (multipart/form-data) | /dataset | Upload a dataset |
| GET | /dataset | Get all datasets |
| GET | /dataset/:id | Get a dataset by id |
| GET | /dataset/:id/download | Download a dataset by id |
| PUT (json) | /dataset/:id | Update a dataset by id |
| DELETE | /dataset/:id | Delete a dataset by id |
<br/>
| POST (json) | /processing | Request a dataset processing |
| GET | /processing | Get all processing |
| GET | /processing/:id | Get a processing by id |
| GET | /processing/:id/download | Download a processing file by id |
| DELETE | /processing/:id | Delete a processing by id with all files |