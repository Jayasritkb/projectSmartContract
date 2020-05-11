/* copied from
https://nextjs.org/learn/basics/server-side-support-for-clean-urls
/create-a-custom-server*/
const express = require('express');
const next = require('next');

//const { createServer } = require ('http');

const app = next({
  dev: process.env.NODE_ENV !== 'production'
});

const routes = require('./routes');

const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  server.get('*', (req, res)  => {
    return handle(req,res);
  });

  server.listen(3000, (err) => {
    if (err) throw console.err
    console.log('> Ready on http://localhost:3000');
  });
//  createServer(handler).listen(3000)
}).catch((ex) => {
  console.error(ex.stack);
  process.exit();1
});
