"use strict";

const http2 = require('http2');

http2.get('https://google.com', response => response.pipe(process.stdout)).end();
http2.get('https://google.com', response => response.pipe(process.stdout)).end();
http2.get('https://google.com', response => response.pipe(process.stdout)).end();
http2.get('https://google.com', response => response.pipe(process.stdout)).end();
