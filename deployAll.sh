#!/bin/bash

cd modules
cd SubpingRDB
npm run build
cd ..
cd ..

cd services
cd auth
npm i
sls deploy

cd ..
cd service
npm i
sls deploy

cd ..
cd user
npm i
sls deploy
