#!/bin/bash

BASE_PORT=3333
BASE_URL="localhost:$BASE_PORT"
PROCESSOR="droidaugmentor"
SLEEP_TIME=3

if ! [ -x "$(command -v jq)" ]; then
  echo 'This script requires the package "jq" to parse JSON outputs.'
  echo 'jq is not installed. Attempting to install jq now...'
  echo 'Requires sudo access to install jq...'
  sudo apt-get update && sudo apt-get install jq -y
fi

clear

echo -e "=================================================================="
echo -e "|                         AutoDroid Demo                         |"
echo -e "|                                                                |"
echo -e "| Remember to keep the start.sh script running on other terminal |"
echo -e "|                  Press CTRL+C to exit anytime                  |"
echo -e "|                                                                |"
echo -e "=================================================================="
echo -e "|         Awaiting AutoDroid to be available at port $BASE_PORT        |"

while [[ "$(curl -s -o /dev/null -w ''%{http_code}'' $BASE_URL/health)" != "200" ]]; do sleep 1; done
echo -e "|          AutoDroid is available, starting the demo now         |"
echo -e "=================================================================="

# 1. Register a new user
echo -e "\n1. Register a new user - POST /user/register"
USER_ID=$(curl -s -X POST $BASE_URL/user/register | jq -r '.id')
if [ $? -ne 0 ] || [ "$USER_ID" = "null" ] || [ -z "$USER_ID" ]; then
  echo -e "Failed to register user"
  exit 1
fi
echo -e "User registered with id: $USER_ID"

sleep $SLEEP_TIME

# 2. Show the available processors
echo -e "\n2. Get the available processors - GET /processor"
PROCESSOR_REQUEST=$(curl -s $BASE_URL/processor)
if [ $? -ne 0 ] || [ "$PROCESSOR_REQUEST" = "null" ]; then
  echo -e "Failed to get the processors"
  exit 1
fi
PROCESSOR_LIST=$(echo "$PROCESSOR_REQUEST" | jq -r '.[].code' | tr '\n' ' ')
PROCESSOR_CODE=$(echo "$PROCESSOR_REQUEST" | jq -r --arg code "$PROCESSOR" '.[] | select(.code == $code).code')
echo -e "Available processors: $PROCESSOR_LIST"
echo -e "Processor $PROCESSOR_CODE is available"

sleep $SLEEP_TIME

# 3. Upload a dataset
echo -e "\n3. Upload a dataset - POST /dataset"
DATASET_ID=$(curl -s -X POST $BASE_URL/dataset -H "Authorization: Bearer $USER_ID" -H 'Content-Type: multipart/form-data' -F "dataset=@./docs/samples/dataset_example.csv;type=text/csv" -F 'description=An awesome dataset' | jq -r '.id')
if [ $? -ne 0 ] || [ "$DATASET_ID" = "null" ] || [ -z "$DATASET_ID" ]; then
  echo -e "Failed to upload the dataset"
  exit 1
fi
echo -e "Dataset uploaded with id: $DATASET_ID"

sleep $SLEEP_TIME

# 4. Request dataset processing
echo -e "\n4. Request dataset processing - POST /processing"
PROCESSING_REQUEST=$(curl -s -X POST $BASE_URL/processing \
            -H "Authorization: Bearer $USER_ID" \
            -H 'Content-Type: application/json' \
            -d @- << EOF
{
    "dataset_id": "$DATASET_ID",
    "processor": "$PROCESSOR_CODE",
    "params": {
        "verbosity": "20",
        "dense_layer_sizes_g": "256",
        "dense_layer_sizes_d": "256",
        "number_epochs": "1000",
        "training_algorithm": "Adam"
    }
}
EOF
)
if [ $? -ne 0 ] || [ "$PROCESSING_REQUEST" = "null" ]; then
    echo -e "Failed to request dataset processing"
    exit 1
fi
PROCESSING_ID=$(echo "$PROCESSING_REQUEST" | jq -r '.id')
if [ $? -ne 0 ] || [ "$PROCESSING_ID" = "null" ] || [ -z "$PROCESSING_ID" ]; then
    echo -e "Failed to load dataset processing"
    exit 1
fi
echo -e "Dataset processing requested with id: $PROCESSING_ID"

sleep $SLEEP_TIME

# 5. Get the processing status
echo -e "\n5. Get the processing status - GET /processing/$PROCESSING_ID"
while true; do
    sleep 1
    PROCESSING_RESPONSE=$(curl -s -H "Authorization: Bearer $USER_ID" $BASE_URL/processing/$PROCESSING_ID)
    if [ $? -ne 0 ] || [ "$PROCESSING_RESPONSE" = "null" ]; then
        echo -e "Failed to get the processing $PROCESSING_ID"
        exit 1
    fi
    PROCESSING_FINISHED=$(echo "$PROCESSING_RESPONSE" | jq -r '.processing.finished_at')
    PROCESSING_STARTED=$(echo "$PROCESSING_RESPONSE" | jq -r '.processing.started_at')

    if [ "$PROCESSING_STARTED" != "null" ]; then
        STARTED_AT=$(date -d "$PROCESSING_STARTED" '+%s')
        NOW=$(date '+%s')
        RUNNING_TIME=$((NOW - STARTED_AT))
        RUNNING_TIME=$(date -d @$RUNNING_TIME -u +%H:%M:%S)
    else
        RUNNING_TIME="00:00:00"
    fi

    if [ "$PROCESSING_FINISHED" == "null" ]; then
        echo -ne "\rProcessing still running $RUNNING_TIME\033[K"
    else
        echo -ne "\rProcessing finished with $RUNNING_TIME\033[K"
        break
    fi
done

sleep $SLEEP_TIME

# 6. Get the processing results
echo -e "\n\n6. Show the processing results - GET /processing/$PROCESSING_ID"
PROCESSING_RESPONSE=$(curl -s -H "Authorization: Bearer $USER_ID" $BASE_URL/processing/$PROCESSING_ID)
echo "$PROCESSING_RESPONSE" | jq -r '.processing.files'

echo -e "\nDownload any file from line above using the following command replaceing <<path>> with the entire selected line:"
echo -e "\ncurl -O -H "Authorization: Bearer $USER_ID" $BASE_URL/processing/$PROCESSING_ID/download/<<path>>"

echo -e "\nAutoDroid Demo finished!"