const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;
const http = require('http').Server(app);
const io = require('socket.io')(http);

app
  .get('/', (req, res) => res.sendFile(__dirname + '/index.html'))
  .get('/storage/:type/:file', (req, res) => res.sendFile(__dirname + '/storage/' + req.params.type + '/' + req.params.file));

io.on('connection', (socket) => {
    socket.on('move', (pos) => {
        console.log('requested move to ' + pos.x + ' ' + pos.y);
    });
});
http.listen(PORT, () => console.log(`Listening on ${ PORT }`));
