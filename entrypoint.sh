#!/bin/bash

export API_URL=${API_URL:-http://localhost:4000}

# Rewrite config.json to point to the API URL
cd /composer-UI/
sed -i "s,var composer_api_host=.*,var composer_api_host=\"$API_URL\";," ./public/js/config.js

# Launch the composer-UI using node
node run start --no-hmr