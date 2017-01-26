/*
 * Set up logging using winston which seems to be the way to log node.js applications
 */
var winston = require('winston');
require('winston-daily-rotate-file');
    
var transport = new winston.transports.DailyRotateFile({
        filename: 'webhook.log',
        datePattern: 'yyyy-MM-dd.',
        prepend: true,
        //level: process.env.ENV === 'development' ? 'debug' : 'info'
        level: 'info' 
});
  
var logger = new (winston.Logger)({
        transports: [
            transport
        ]
});

module.exports = logger;
