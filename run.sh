#!/bin/bash
browserify -t coffeeify --extension=".coffee" ./Browserify/main.coffee -o ./js/bundle.js & 
cp compiledJS/server.js server.js &
coffee $1