const socket = io();

// the board in a 2d array
let board = [
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
];

// the divs for the board pieces
let div = [];

// who's turn it is
let turn;

// the player id of this client
let player;

// this is used for when placing a piece to know where to stop
let index = 0;

// the client's gameID
let gameid;

// the client's username
let username;

// the colour of the user
let colour;

// if moves can be allowed for the client, used just after a turn before the server can respond
let dontAllowMoves = false;

// gameID's to show for the menu
let shownID = [];

// the counter for how long you have taken in your turn
let counter = 0;

// if the user has already lost
let hasLost = false;

// the interval timer for the counter
let interval;

// when the page is loaded, get all of the games
socket.emit("getTimes");

// create the board
function createBoard() {
  // show the board
  document.getElementById("board").style = "";
  document.getElementById("hasOpponent").style = "";
  // remove the setup and server list
  document.getElementById("serverSetup").style = "display: none";
  document.getElementById("serverList").style = "display: none";
  // set the username value
  username = document.getElementById("username").value;
  // set the username below the board
  let name = document.createElement("p");
  name.innerHTML = username;
  document.getElementById("players").appendChild(name);
  for (let i = 0; i < board.length; i++) {
    //create the board's divs and add them
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
  // this is called when a piece is placed
  // if you are not meant to allow moves, return
  if (dontAllowMoves === true) return;
  // if it's not your turn, return.
  if (document.getElementById("turn").innerHTML !== "your turn") return;
  // if it is turned from a server's call
  if ((turn % 2 === 1 && board[0][j] === 0) || turn[0] === 0 || turn === 0) {
    // if it's a red piece, change it to red
    colourChange("red", j);
    board[index - 1][j] = 1;
  } else if (board[0][j] === 0) {
    // if it's a yellow piece, change it to gold
    colourChange("gold", j);
    board[index - 1][j] = 2;
  }
  if (!bypass) {
    // if it is turned from the client
    socket.emit("move", j, gameid);
    dontAllowMoves = true;
  }
  // check if the game has been won
  checkWin();
}

function colourChange(colour, j) {
  // this is used to place the piece as low as it can go without going through another piece
  index = 0;
  while (index < 6 && board[index][j] === 0) {
    if (index > 0) {
      div[index - 1][j].style = "";
    }
    // change the div colour
    div[index][j].style = `background-color: ${colour};`;
    index++;
  }
  // increase the turn counter
  turn++;
}

function hoverOver(j) {
  // on hover change the style of it to be the weird shape
  for (let i = 0; i < board.length; i++) {
    for (let k = 0; k < board[i].length; k++) {
      if (k === j) {
        div[i][j].classList = "hover hole";
      } else {
        div[i][k].classList = "hole";
      }
    }
  }
}

function checkWin() {
  // check if the game has been won at every position
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      checkSurrounding(i, j);
    }
  }
}

function checkSurrounding(i, j) {
  // if it is not out of bounds and there is four in a row
  if (
    i < 3 &&
    board[i][j] !== 0 &&
    board[i][j] === board[i + 1][j] &&
    board[i][j] === board[i + 2][j] &&
    board[i][j] === board[i + 3][j]
  ) {
    // then show the win screen
    document.getElementById("won").style = "";
    // this is repeated for all of the different cases (diagonal left and right, horizontal and vertical)
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
    // if it has not been won, return
    return;
  }
  // if it has been won, send a gameover message to the server
  socket.emit("gameover", gameid);
  // no need to keep the turn information
  document.getElementById("turn").innerHTML = "";
  // after 100ms disconnect from the server
  setTimeout(() => {
    socket.disconnect();
  }, 100);
  // show the win screen
  document.getElementById("won").style = "";
  if (board[i][j] !== player) {
    // if you win then show you win
    document.getElementById("won").innerHTML = "You win!";
  } else {
    // if you don't win then show you lose
    document.getElementById("won").innerHTML = "You lose :(";
  }
}

function createServer() {
  // if the create server button is pressed show the create server card
  document.getElementById("serverSetup").style = "display: flex";
  document.getElementById("serverList").style = "display: none";
  document.getElementById("password").style = "display: intial";
}

function joinServer(id) {
  // when you press to join a server, show the join server card
  document.getElementById("serverSetup").style = "display: flex";
  document.getElementById("serverList").style = "display: none";
  document
    .getElementById("joinGame")
    .setAttribute("onclick", `joinGame("${id}")`);
}

function timer() {
  // this is used to count if the user has gone past 30s, although it uses setinterval so it is not that accurate
  counter++;
  document.getElementById("counter").innerHTML = counter;
  if (counter >= 30) {
    // if you have lost, stop the counter
    clearInterval(interval);
    hasLost = true;
    // tell the server the game is over
    socket.emit("gameover", gameid, true);
    document.getElementById("turn").innerHTML = "";
    // show the win screen
    document.getElementById("won").style = "";
    // show on the win screen that you took too long
    document.getElementById("won").innerHTML = "Took too long :(";
    // disconnect from the server
    setTimeout(() => {
      socket.disconnect();
    }, 100);
  }
}

function joinGame(join) {
  // if you try to make a game and the fields aren't filled out, don't make a game
  if (
    document.getElementById("username").value === "" ||
    (document.getElementById("password").value === "" && !join)
  ) {
    alert("fill out the fields!");
    return;
  }
  let pw;
  if (join) {
    // if you are joining a game and you don't have a server id, then use the one given
    pw = join;
  } else {
    // otherwise use the gameid you made
    pw = document.getElementById("password").value;
  }
  // create the board
  createBoard();
  // make a temporary random gameid
  gameid = Math.random();
  // emit the gameid to the server and create the game
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
      document.getElementById("players").lastChild.classList = "current-player";
    } else {
      document.getElementById("players").firstChild.classList =
        "current-player";
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
        "current-player";
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
          "current-player";
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
      usernameID.classList = "server-p server-username";
      div.appendChild(usernameID);
      let button = document.createElement("button");
      button.innerHTML = "Join Game";
      button.classList = "server-button";
      button.setAttribute("onclick", `joinServer("${gameID[i]}")`);
      div.appendChild(button);
      let serverID = document.createElement("p");
      serverID.innerHTML = gameID[i];
      serverID.classList = "server-p";
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
