# Riika

## Installation

    $ git clone ...
    $ cd mnh-core

    $ npm install

## Run webpack dev server

For local run with hot-reload 

    $ npm start

## Build

    $ npm run build

After build, compiled application will be placed in `dist/` folder.

Build with logs:

    $ npm run build:dev

##### Variables

You can build with additional environment variables:

    ENV - 'dev', 'stage', 'production' - will show/hide some features
    API_URL - URL for REST requests
    PUBLIC_PATH - the path to files on server
    BUILD_NUMBER - set by bitbucket pipelines
    PROXY_URL - URL for proxy (works only with `$ npm start`)
    GTM_ID - Id of Google Tag Manager (GTM-XXXXXX)

Examples of use:

    $ ENV=stage npm build
    $ ENV=stage API_URL="http://your.server/api" npm build

##### Build and run

    $ npm run build
    $ npm run start:dist
