#!/bin/bash

docker run --name t3-spotify -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres

