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

fs.readFile(__dirname + '/locations/disco/borders.txt', 'utf8', (err, data) => {
    if (err) throw err;
    let inp = data.split(' ');
    for (let i = 0; i < inp.length; i += 2)
        fence.push([parseInt(inp[i]), parseInt(inp[i+1])]);
    console.log(fence.length)
});


function dst(x1, y1, x2, y2) {
    return Math.sqrt((x2-x1) * (x2-x1) + (y2-y1) * (y2-y1));
}

const speed = 25;

io.on('connection', (socket) => {
    let id = random_id();
    io.emit('draw', {uid: id, info: {skin: 'character', x: 362, y: 245}});
    for (let player of players)
        socket.emit('draw', {uid: player[0], info: player[1]});
    players.set(id, {skin: 'character', x: 362, y: 245});
    let moveId = -1;
    socket.on('move', (pos) => {
        let mx = pos.x;
        let my = pos.y;
        let x0 = players.get(id).x;
        let y0 = players.get(id).y;
        let t = 0;
        let time = dst(x0, y0, mx, my) / speed;
        let vx = (mx - x0) / time;
        let vy = (my - y0) / time;
        if (moveId !== -1) clearInterval(moveId);
        moveId = setInterval(() => {
            if (t >= time) {
                clearInterval(moveId);
                moveId = -1;
                return;
            }
            for (let i = 0; i < fence.length; ++i)
                if (dst(x0 + vx * t, y0 + vy * t, fence[i][0], fence[i][1]) < 3) {
                    clearInterval(moveId);
                    moveId = -1;
                    return;
                }
                io.emit('move', {uid: id, x: x0 + vx * t, y: y0 + vy * t});
        }, 50);
    });
    socket.on('disconnect', () => {
        players.remove(id);
        io.emit('remove', id);
    });
});
http.listen(PORT, () => console.log(`Listening on ${ PORT }`));
