const socket = io();

let board = [
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
];
let div = [];
let turn;
let player;
let index = 0;
let gameid;
let username;
let colour;

let startTime;

function createBoard() {
  document.getElementById("board").style = "";
  document.getElementById("serverSetup").style = "display: none";
  username = document.getElementById("username").value;
  let name = document.createElement("p");
  name.innerHTML = username;
  document.getElementById("players").appendChild(name);
  for (let i = 0; i < board.length; i++) {
    div[i] = [];
    for (let j = 0; j < board[i].length; j++) {
      div[i][j] = document.createElement("div");
      div[i][j].classList = "hole";
      div[i][j].setAttribute("onclick", `setColour(${j}, false)`);
      div[i][j].setAttribute("onmouseover", `hoverOver(${j})`);
      document.getElementById("board").appendChild(div[i][j]);
    }
    let br = document.createElement("div");
    br.classList = "break";
    document.getElementById("board").appendChild(br);
  }
}

function setColour(j, bypass) {
  if (document.getElementById("turn").innerHTML !== "your turn") return;
  if ((turn % 2 === 1 && board[0][j] === 0) || turn[0] === 0 || turn === 0) {
    colourChange("red", j);
    board[index - 1][j] = 1;
  } else if (board[0][j] === 0) {
    colourChange("gold", j);
    board[index - 1][j] = 2;
  }
  setTimeout(() => {
    if (!bypass) socket.emit("move", j, gameid);
    checkWin();
  }, 100);
}

function colourChange(colour, j) {
  index = 0;
  while (index < 6 && board[index][j] === 0) {
    if (index > 0) {
      div[index - 1][j].style = "";
    }
    div[index][j].style = `background-color: ${colour};`;
    index++;
  }
  turn++;
}

function hoverOver(j) {
  for (let i = 0; i < board.length; i++) {
    for (let k = 0; k < board[i].length; k++) {
      if (k === j) {
        div[i][j].classList = "hover hole ";
      } else {
        div[i][k].classList = "hole";
      }
    }
  }
}

function checkWin() {
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      checkSurrounding(i, j);
    }
  }
}

function checkSurrounding(i, j) {
  if (
    i < 3 &&
    board[i][j] !== 0 &&
    board[i][j] === board[i + 1][j] &&
    board[i][j] === board[i + 2][j] &&
    board[i][j] === board[i + 3][j]
  ) {
    document.getElementById("won").style = "";
  } else if (
    j <= 4 &&
    board[i][j] !== 0 &&
    board[i][j] === board[i][j + 1] &&
    board[i][j] === board[i][j + 2] &&
    board[i][j] === board[i][j + 3]
  ) {
    document.getElementById("won").style = "";
  } else if (
    j <= 4 &&
    i < 3 &&
    board[i][j] !== 0 &&
    board[i + 1][j + 1] === board[i][j] &&
    board[i + 2][j + 2] === board[i][j] &&
    board[i + 3][j + 3] === board[i][j]
  ) {
    document.getElementById("won").style = "";
  } else if (
    j <= 4 &&
    i > 2 &&
    board[i][j] !== 0 &&
    board[i - 1][j + 1] === board[i][j] &&
    board[i - 2][j + 2] === board[i][j] &&
    board[i - 3][j + 3] === board[i][j]
  ) {
    document.getElementById("won").style = "";
  } else {
    return;
  }
  socket.emit("gameover", gameid);
  document.getElementById("turn").innerHTML = "";
  setTimeout(() => {
    socket.disconnect();
  }, 100);
  document.getElementById("restart").style = "";
  if (board[i][j] === 1) {
    document.getElementById("won").style = "color: red";
  } else {
    document.getElementById("won").style = "color: gold";
  }
}

function joinGame() {
  createBoard();
  gameid = Math.random();
  socket.emit("password", document.getElementById("password").value, gameid);
}

socket.on("move", function (data, id) {
  if (id === gameid) {
    if ((turn + 1) % 2 === player - 1) {
      console.log("data: " + data);
      setColour(data, true);
    }
  }
});

socket.on("username", function (data, id, p) {
  if (
    id === gameid &&
    p !== player &&
    document.getElementById("players").childElementCount < 2
  ) {
    let name = document.createElement("p");
    if (colour === " 🟡 ") {
      name.innerHTML = " 🔴 " + data;
    } else {
      name.innerHTML = " 🟡 " + data;
    }
    document.getElementById("players").appendChild(name);
    socket.emit("username", username, gameid, player);
    if (document.getElementById("turn").innerHTML === "not your turn") {
      document.getElementById("players").lastChild.classList = "current_player";
    } else {
      document.getElementById("players").firstChild.classList =
        "current_player";
    }
  }
});

socket.on("return", function (pass, id) {
  if (gameid === id) {
    if (pass !== false) {
      console.log("joined game");
      gameid = pass;
      socket.emit("new player", pass);
    } else {
      console.log("wrong password");
    }
  }
});

socket.on("player", function (data, id) {
  if (player === 1 && id === gameid) {
    document.getElementById("hasOpponent").innerHTML = "opponent found";
    colour = " 🟡 ";
    socket.emit("username", username, gameid, player);
    document.getElementById("players").firstChild.innerHTML += colour;
  } else if (!player && data && gameid) {
    player = data;
    console.log("player: " + data);
    document.getElementById("leave").style = "";
  } else if (!data) {
    document.getElementById("hasOpponent").innerHTML = "no games available";
  }
  if (player === 2 && id === gameid) {
    document.getElementById("hasOpponent").innerHTML = "opponent found";
    colour = " 🔴 ";
    document.getElementById("players").firstChild.innerHTML += colour;
  }
});

socket.on("turn", function (t, id) {
  if (id === gameid) {
    turn = t;
    console.log("turn: " + ((turn + 1) % 2));
    if ((turn + 1) % 2 === player - 1) {
      console.log("here");
      document.getElementById("turn").innerHTML = "your turn";
      document.getElementById("players").firstChild.classList =
        "current_player";
      document.getElementById("players").lastChild.classList = "";
    } else {
      document.getElementById("turn").innerHTML = "not your turn";
      if (document.getElementById("players").childElementCount > 1) {
        document.getElementById("players").firstChild.classList = "";
        document.getElementById("players").lastChild.classList =
          "current_player";
      }
    }
  }
});
