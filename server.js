const express = require("express");
const http = require("http");
const path = require("path");
const socketIO = require("socket.io");

const app = express();
const server = http.Server(app);
const io = socketIO(server);

let players = [1];

let gameid = ["1"];

let turn = [0];
var port = process.env.PORT || 5000;

app.use("/static", express.static(__dirname + "/static"));

app.get("/", function (request, response) {
  response.sendFile(path.join(__dirname, "index.html"));
});

// server.listen(5000, function () {
//   console.log("Starting server on port 5000");
// });

app.listen(port, function () {
  console.log("Our app is running on http://localhost:" + port);
});

io.on("connection", function (socket) {
  socket.on("new player", function (id) {
    if (players[gameid.indexOf(id)] <= 2) {
      console.log("making new player on id", id);
      io.sockets.emit("player", players[players.length - 1], id);
      io.sockets.emit("turn", turn[turn.length - 1], id);
      players[gameid.indexOf(id)]++;
    }
  });

  socket.on("move", function (move, id) {
    console.log(move);
    turn[gameid.indexOf(id)]++;
    console.log(turn[gameid.indexOf(id)]);
    io.sockets.emit("turn", turn[gameid.indexOf(id)], id);
    io.sockets.emit("move", move, id);
  });

  socket.on("gameover", function (id) {
    console.log("game over", id);
    turn.splice(gameid.indexOf(id), 1);
    players.splice(gameid.indexOf(id), 1);
    gameid.splice(gameid.indexOf(id), 1);
  });

  socket.on("password", function (pass, id) {
    if (pass[pass.length - 1] === " ") {
      let temp = "";
      for (let i = 0; i < pass.length - 1; i++) {
        temp += pass[i];
      }
      pass = temp;
    }
    if (gameid.includes(pass)) {
      io.sockets.emit("return", pass, id);
      console.log(gameid);
    } else {
      gameid.push(pass);
      turn.push(0);
      players.push(1);
      io.sockets.emit("return", pass, id);
      console.log(gameid);
    }
  });
});
