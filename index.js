const express = require('express');
const PORT = process.env.PORT || 5000;

express()
  .get('/', (req, res) => res.sendFile(__dirname + '/index.html'))
    .get('/storage/:type/:file', (req, res) => res.sendFile(__dirname + '/storage/' + req.params.type + '/' + req.params.file))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));
