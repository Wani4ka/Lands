const express = require('express');
const fs = require("fs");
const app = express();
const PORT = process.env.PORT || 5000;
const http = require('http').Server(app);
const io = require('socket.io')(http);

app
  .get('/', (req, res) => res.sendFile(__dirname + '/index.html'))
  .get('/storage/:type/:file', (req, res) => res.sendFile(__dirname + '/storage/' + req.params.type + '/' + req.params.file));

function random_id() {
    const alphabet = '0123456789';
    let ans = '';
    for (let i = 0; i < 10; ++i)
        ans += alphabet[Math.round(Math.random() * 10)];
    return ans;
}

const players = new Map();

const fence = [];
fs.readFile(__dirname + '/locations/disco/borders.txt', (err, data) => {
    if (err) throw err;
    console.log(data);
});

io.on('connection', (socket) => {
    let id = random_id();
    players.set(id, {skin: 'character', x: 362, y: 245});
    socket.emit('auth', id);
    io.emit('draw', {uid: id, info: players.get(id)});
    let moveId = -1;
    socket.on('move', (pos) => {
        let mx = pos.x;
        my = pos.y;
        x0 = players.get(id).x;
        y0 = players.get(id).y;
        t = 0;
        time = Math.sqrt((mx - x0) * (mx - x0) + (my - y0) * (my - y0)) / speed;
        vx = (mx - x0) / time;
        vy = (my - y0) / time;
        if (moveId !== -1) clearInterval(moveId);
        moveId = setInterval(() => {
            if (t >= time) {
                clearInterval(moveId);
                return;
            }

        }, 50);
        io.emit('move', {uid: id, x: })
    });
});
http.listen(PORT, () => console.log(`Listening on ${ PORT }`));
