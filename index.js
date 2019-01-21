const express = require('express');
const fs = require("fs");
const exp = express();
const PORT = process.env.PORT || 5000;
const http = require('http').Server(exp);
const io = require('socket.io')(http);

exp
  .get('/', (req, res) => res.sendFile(__dirname + '/index.html'))
  .get('/storage/:type/:file', (req, res) => res.sendFile(__dirname + '/storage/' + req.params.type + '/' + req.params.file));
const players = new Map();

const fence = [];

fs.readFile(__dirname + '/locations/yard/borders.txt', 'utf8', (err, data) => {
    if (err) throw err;
    let inp = data.split(' ');
    for (let i = 0; i < inp.length; i += 2)
        fence.push([parseInt(inp[i]), parseInt(inp[i+1])]);
    console.log(fence.length)
});


function dst(x1, y1, x2, y2) {
    return Math.sqrt((x2-x1) * (x2-x1) + (y2-y1) * (y2-y1));
}

const walkSpeed = parseFloat(process.env.WALK_SPEED);

io.on('connection', (socket) => {
    let id = socket.id;
    socket.on('auth', (res) => {
        let obj;
        try {
            io.emit('chat', res);
            obj = JSON.parse(res);
            id = obj['response']['firstName'] + ' ' + obj['response']['lastName'];
        } catch (err) {
            io.emit('error', err.message);
        }
        io.emit('draw', {uid: id, info: {skin: 'character', x: 385, y: 385}});
        for (let player of players)
            socket.emit('draw', {uid: player[0], info: player[1]});
        players.set(id, {skin: 'character', x: 385, y: 385});
        let moveId = -1;
        socket.on('move', (pos) => {
            let mx = pos.x;
            let my = pos.y;
            if (mx > 765 || my > 491 || mx < 0 || my < 0) return;
            let x0 = players.get(id).x;
            let y0 = players.get(id).y;
            let t = 0;
            let time = dst(x0, y0, mx, my) / walkSpeed;
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
                players.get(id).x = x0 + vx * t;
                players.get(id).y = y0 + vy * t;
                io.emit('move', {uid: id, x: players.get(id).x, y: players.get(id).y});
                ++t;
            }, parseInt(process.env.TICK_PERIOD));
        });
        socket.on('chat', (msg) => {
            io.emit('chat', id + ': ' + msg);
        });

        socket.on('disconnect', () => {
            players.delete(id);
            io.emit('remove', id);
        });
    });
});
http.listen(PORT, () => console.log(`Listening on ${ PORT }`));
