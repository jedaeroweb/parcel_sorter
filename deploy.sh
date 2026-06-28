#!/bin/bash

set -e

cd /home/deploy/sorter

git pull

npm install

npm run build

pm2 restart sorter

echo "Deploy Complete!"