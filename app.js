/**
 * Main file for the simple webhook to hook from segment.io to Node.js
 *
 * Dave Andreasen 01/18/2017 ChargeItSpot
 */
var logger = require('./log');
 
logger.info('WebHook startup');

var sslMode = false;
var args = process.argv.slice(2);
if(args.length > 0 && args[0] === "ssl") {
    sslMode = true;
}

var http;
//Lets define a port we want to listen to for local development
const PORT = 8080;
var options;
if( sslMode ) {
    logger.info('SSL Mode.');

    // this is for HTTPS
    http = require('https');
    var fs = require('fs');

    options = {
          // these are sample values - adjust to your own keys
          key: fs.readFileSync('ssl.key'),
          cert: fs.readFileSync('ssl.crt'),
          ca : fs.readFileSync('ca.crt')
    };
} else {
    logger.info('Standard Mode.');

    // this is for HTTP
    http = require('http');

    options = { };
}

// these apply no matter if we use HTTP or HTTPS
var HttpDispatcher = require('httpdispatcher');
var dispatcher = new HttpDispatcher();


dispatcher.onPost("/webhook", function(req, res) {
    var body = req.body;

    logger.debug("webhook received request ", body);

    //var json = JSON.parse(fakeJson);
    var json = JSON.parse(body);

    if( json === undefined || json.type === undefined || json.userId === undefined ) {
        logger.error("JSON mal-formed or not present", json);

        res.writeHead(500, {'Content-Type': 'text/plain'});
        res.end('Error with JSON data');

        return;
    }

    // here is how to ignore stuff other than identify
    if(json.type != "identify") {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('Ignoring requests other than identify');

        return;
    }


    if( json.traits === undefined || json.traits.email === undefined ) {
        logger.error("Identify request missing elements", json);

        res.writeHead(500, {'Content-Type': 'text/plain'});
        res.end('Error getting data from identify request');

        return;
    }

    // at this point, you do whatever you need to do with the request

});

var fakeJson = `{
    "type": "identify",
    "messageId": "16cccad1-1e1a-4643-b2b5-39ddb5e49bbd",
    "timestamp": "2016-03-22T18:48:16.688Z", 
    "context": {
        "timezone": "EST5EDT",
        "locale": "en_US",
        "library": {
            "name": "analytics-java",
            "version": "analytics/2.0.0-RC3" 
        }
    },
    "userId": "1114447777",
    "integrations": {},
    "traits": {
        "email": "MMMNNNBBB@GMAIL.COM",
        "brand": "ChargeItSpot Test"
    },
    "writeKey": "yourwritekey",
    "sentAt": "2016-03-22T18:48:23.000Z",
    "receivedAt": "2016-03-22T18:48:26.688Z",
    "originalTimestamp": "2016-03-22T18:48:13+0000"}`;

//We need a function which handles requests and send response
function handleRequest(request, response) {
    try {
        //log the request on console
        //console.log(request.url);
        
        //Disptach
        dispatcher.dispatch(request, response);
    } catch(err) {
        logger.error(err);
    }
}

//Create a server
var server;
if( sslMode ) {
    server = http.createServer(options, handleRequest);
} else {
    server = http.createServer(handleRequest);
}

//Lets start our server
server.listen(PORT, function(){
    //Callback triggered when server is successfully listening. Hurray!
    logger.info("Server listening on: http://localhost:%s", PORT);
});
