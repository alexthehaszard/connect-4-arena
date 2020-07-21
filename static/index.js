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
let dontAllowMoves = false;
let shownID = [];
let counter = 0;

let hasLost = false;

let interval;

let startTime;

socket.emit("getTimes");

function createBoard() {
  document.getElementById("board").style = "";
  document.getElementById("hasOpponent").style = "";
  document.getElementById("serverSetup").style = "display: none";
  document.getElementById("serverList").style = "display: none";
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
  }
}

function setColour(j, bypass) {
  if (dontAllowMoves === true) return;
  if (document.getElementById("turn").innerHTML !== "your turn") return;
  if ((turn % 2 === 1 && board[0][j] === 0) || turn[0] === 0 || turn === 0) {
    colourChange("red", j);
    board[index - 1][j] = 1;
  } else if (board[0][j] === 0) {
    colourChange("gold", j);
    board[index - 1][j] = 2;
  }
  if (!bypass) {
    socket.emit("move", j, gameid);
    dontAllowMoves = true;
  }
  checkWin();
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
  document.getElementById("won").style = "";
  if (board[i][j] !== player) {
    document.getElementById("won").innerHTML = "You win!";
  } else {
    document.getElementById("won").innerHTML = "You lose :(";
  }
}

function createServer() {
  document.getElementById("serverSetup").style = "display: flex";
  document.getElementById("serverList").style = "display: none";
  document.getElementById("password").style = "display: intial";
}

function joinServer(id) {
  document.getElementById("serverSetup").style = "display: flex";
  document.getElementById("serverList").style = "display: none";
  document
    .getElementById("joinGame")
    .setAttribute("onclick", `joinGame("${id}")`);
}

function timer() {
  console.log("go");
  counter++;
  document.getElementById("counter").innerHTML = counter;
  if (counter >= 30) {
    clearInterval(interval);
    hasLost = true;
    socket.emit("gameover", gameid, true);
    document.getElementById("turn").innerHTML = "";
    document.getElementById("won").style = "";
    document.getElementById("won").innerHTML = "Took too long :(";
    setTimeout(() => {
      socket.disconnect();
    }, 100);
  }
}

function joinGame(join) {
  if (
    document.getElementById("username").innerHTML === "" ||
    document.getElementById("password").innerHTML === ""
  ) {
    alert("fill out the fields!");
    return;
  }
  let pw;
  if (join) {
    pw = join;
  } else {
    pw = document.getElementById("password").value;
  }
  createBoard();
  gameid = Math.random();
  socket.emit("password", pw, gameid, username);
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

    // create the counter element
    let count = document.createElement("p");
    count.innerHTML = counter;
    count.id = "counter";
    document.getElementById("players").appendChild(count);

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
    colour = " 🟡 ";
    socket.emit("username", username, gameid, player);
    document.getElementById("players").firstChild.innerHTML += colour;
    document.getElementById("turn").style = "display: none";
    document.getElementById("hasOpponent").style = "display: none";
  } else if (!player && data && gameid) {
    player = data;
    console.log("player: " + data);
    document.getElementById("leave").style = "";
  } else if (!data) {
  }
  if (player === 2 && id === gameid) {
    colour = " 🔴 ";
    document.getElementById("players").firstChild.innerHTML += colour;
    document.getElementById("turn").style = "display: none";
    document.getElementById("hasOpponent").style = "display: none";
  }
});

socket.on("turn", function (t, id) {
  if (id === gameid) {
    turn = t;
    console.log("turn: " + ((turn + 1) % 2));
    if ((turn + 1) % 2 === player - 1) {
      document.getElementById("turn").innerHTML = "your turn";
      counter = 0;
      interval = setInterval(() => {
        timer();
      }, 1000);
      dontAllowMoves = false;
      document.getElementById("players").firstChild.classList =
        "current_player";
      document.getElementById("players").lastChild.classList = "";
    } else {
      clearInterval(interval);
      if (counter > 0) {
        counter = 0;
        document.getElementById("counter").innerHTML = counter;
      }
      document.getElementById("turn").innerHTML = "not your turn";
      dontAllowMoves = false;
      if (document.getElementById("players").childElementCount > 1) {
        document.getElementById("players").firstChild.classList = "";
        document.getElementById("players").lastChild.classList =
          "current_player";
      }
    }
  }
});

socket.on("games", function (gameID, usernames, players) {
  document.getElementById("servers").innerHTML = "";
  for (let i = 0; i < gameID.length; i++) {
    if (players[i] <= 2) {
      let div = document.createElement("div");
      div.classList = "server";
      let usernameID = document.createElement("p");
      usernameID.innerHTML = usernames[i];
      usernameID.classList = "serverP server-username";
      div.appendChild(usernameID);
      let button = document.createElement("button");
      button.innerHTML = "Join Game";
      button.classList = "server-button";
      button.setAttribute("onclick", `joinServer("${gameID[i]}")`);
      div.appendChild(button);
      let serverID = document.createElement("p");
      serverID.innerHTML = gameID[i];
      serverID.classList = "serverP";
      div.appendChild(serverID);
      document.getElementById("servers").appendChild(div);
      shownID.push(gameID[i]);
    }
  }
});

socket.on("gameover", function (id) {
  if (id === gameid) {
    if (hasLost === false) {
      document.getElementById("turn").innerHTML = "";
      document.getElementById("won").style = "";
      document.getElementById("won").innerHTML = "You Win!";
      setTimeout(() => {
        socket.disconnect();
      }, 100);
    }
  }
});
