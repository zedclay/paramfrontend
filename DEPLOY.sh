#!/bin/bash
set -e
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'
SERVER_USER="u355260817"
SERVER_HOST="82.112.243.138"
SERVER_PORT="65002"
echo -e "${GREEN}🚀 Starting deployment...${NC}\n"
echo -e "${YELLOW}📦 Updating backend...${NC}"
ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST 'cd ~/domains/infspsb.com/public_html/api && git pull origin main && php artisan migrate --force && php artisan config:clear && php artisan cache:clear && php artisan route:clear && php artisan view:clear'
echo -e "${YELLOW}🔨 Building frontend...${NC}"
cd frontend && npm run build
echo -e "${YELLOW}📤 Deploying frontend...${NC}"
scp -P $SERVER_PORT -r dist/* $SERVER_USER@$SERVER_HOST:~/domains/infspsb.com/public_html/
echo -e "${GREEN}🎉 Deployment completed!${NC}"
