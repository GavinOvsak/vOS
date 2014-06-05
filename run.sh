#!/bin/bash
browserify -t coffeeify --extension=".coffee" ./Browserify/main.coffee -o ./js/bundle.js & coffee $1