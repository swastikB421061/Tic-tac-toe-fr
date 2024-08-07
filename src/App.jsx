import React, { useState, useEffect } from "react";
import "./App.css";
import Square from "./Square/Square";
import { io } from "socket.io-client";
import Swal from "sweetalert2";
import Chat from "./Chat/Chat";

const renderFrom = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
];

const App = () => {
  const [gameState, setGameState] = useState(renderFrom);
  const [currentPlayer, setCurrentPlayer] = useState("circle");
  const [finishedState, setFinishetState] = useState(false);
  const [finishedArrayState, setFinishedArrayState] = useState([]);
  const [playOnline, setPlayOnline] = useState(false);
  const [socket, setSocket] = useState(null);
  const [playerName, setPlayerName] = useState("");
  const [opponentName, setOpponentName] = useState(null);
  const [playingAs, setPlayingAs] = useState(null);
  const [wait, setWait] = useState(false);

  const checkWinner = () => {
    // row dynamic
    for (let row = 0; row < gameState.length; row++) {
      if (
        gameState[row][0] === gameState[row][1] &&
        gameState[row][1] === gameState[row][2]
      ) {
        setFinishedArrayState([row * 3 + 0, row * 3 + 1, row * 3 + 2]);
        return gameState[row][0];
      }
    }

    // column dynamic
    for (let col = 0; col < gameState.length; col++) {
      if (
        gameState[0][col] === gameState[1][col] &&
        gameState[1][col] === gameState[2][col]
      ) {
        setFinishedArrayState([0 * 3 + col, 1 * 3 + col, 2 * 3 + col]);
        return gameState[0][col];
      }
    }

    if (
      gameState[0][0] === gameState[1][1] &&
      gameState[1][1] === gameState[2][2]
    ) {
      return gameState[0][0];
    }

    if (
      gameState[0][2] === gameState[1][1] &&
      gameState[1][1] === gameState[2][0]
    ) {
      return gameState[0][2];
    }

    const isDrawMatch = gameState.flat().every((e) => {
      if (e === "circle" || e === "cross") return true;
    });

    if (isDrawMatch) return "draw";

    return null;
  };

  useEffect(() => {
    const winner = checkWinner();
    if (winner) {
      setFinishetState(winner);
    }
  }, [gameState]);

  const takePlayerDetails = async () => {
    const result = await Swal.fire({
      title: "Enter only Name for random opponent",

      html: `
      <style>
           .swal2-input {
                    width: 12rem;
                    padding:0px;
                }
        </style>
        <input id="swal-input1" class="swal2-input" placeholder="Name">
        <input id="swal-input2" class="swal2-input" placeholder="RoomID">
      `,
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        const name = document.getElementById("swal-input1").value;
        const roomId = document.getElementById("swal-input2").value;
        if (!name) {
          Swal.showValidationMessage("Name field is required");
        }
        return { name, roomId };
      },
    });
    console.log(result);

    return result;
  };

  socket?.on("opponentLeftMatch", () => {
    setFinishetState("opponentLeftMatch");
  });
  socket?.on("RoomFull", () => {
    setTimeout(() => {
      location.reload();
    }, 2000);
    Swal.fire({
      position: "center",
      icon: "error",
      title: "Room Full",
      showConfirmButton: false,
      timer: 2500,
    });
  });

  socket?.on("playerMoveFromServer", (data) => {
    const id = data.state.id;
    setGameState((prevState) => {
      let newState = [...prevState];
      const rowIndex = Math.floor(id / 3);
      const colIndex = id % 3;
      newState[rowIndex][colIndex] = data.state.sign;
      return newState;
    });
    setCurrentPlayer(data.state.sign === "circle" ? "cross" : "circle");
  });

  socket?.on("connect", function () {
    setPlayOnline(true);
  });

  socket?.on("OpponentNotFound", function () {
    setOpponentName(false);
  });

  socket?.on("OpponentFound", function (data) {
    setPlayingAs(data.playingAs);
    setOpponentName(data.opponentName);
  });

  async function playOnlineClick() {
    setWait(true);
    const result = await takePlayerDetails();
    console.log(result);
    if (!result.isConfirmed) {
      return;
    }
    const { name, roomId } = result.value;
    setPlayerName(name);

    // const newSocket = io("http://localhost:3000", {
    //   autoConnect: true,
    // });
    const newSocket = io("https://tic-tac-toe-be-1e16.onrender.com", {
      autoConnect:true
    });

    newSocket.emit("request_to_play", {
      playerName: name,
      roomId: roomId,
    });
    Swal.fire({
      position: "center",
      icon: "info",
      title: "use larger screen to chat with opponent",
      showConfirmButton: false,
      timer: 2500,
    });
    setSocket(newSocket);
    setWait(false);
  }

  const reset = () => {
    location.reload();
  };

  if (!playOnline) {
    return (
      <div className="main-div">
        <button onClick={playOnlineClick} className="playOnline">
          Play Online
        </button>
      </div>
    );
  }

  if ((playOnline && !opponentName) || wait) {
    return (
      <div className="waiting">
        <span className="loader"></span>
        <p>Waiting for opponent ...</p>
      </div>
    );
  }

  return (
    <div className="full">
      <div className="top"></div>
      <div className="main">
        <div className="chat-comp">
          <Chat socket={socket} />
        </div>
        <div className="main-div">
          <div className="move-detection">
            <div
              className={`left ${
                currentPlayer === playingAs
                  ? "current-move-" + currentPlayer
                  : ""
              }`}
            >
              {playerName}
            </div>
            <div
              className={`right ${
                currentPlayer !== playingAs
                  ? "current-move-" + currentPlayer
                  : ""
              }`}
            >
              {opponentName}
            </div>
          </div>
          <div>
            <h1 className="game-heading water-background">Tic Tac Toe</h1>
            <div className="square-wrapper">
              {gameState.map((arr, rowIndex) =>
                arr.map((e, colIndex) => {
                  return (
                    <Square
                      socket={socket}
                      playingAs={playingAs}
                      gameState={gameState}
                      finishedArrayState={finishedArrayState}
                      finishedState={finishedState}
                      currentPlayer={currentPlayer}
                      setCurrentPlayer={setCurrentPlayer}
                      setGameState={setGameState}
                      id={rowIndex * 3 + colIndex}
                      key={rowIndex * 3 + colIndex}
                      currentElement={e}
                    />
                  );
                })
              )}
            </div>
            {finishedState &&
              finishedState !== "opponentLeftMatch" &&
              finishedState !== "draw" && (
                <h3 className="finished-state">
                  {finishedState === playingAs ? "You " : finishedState} won the
                  game
                </h3>
              )}
            {finishedState &&
              finishedState !== "opponentLeftMatch" &&
              finishedState === "draw" && (
                <h3 className="finished-state">It's a Draw</h3>
              )}
          </div>
          {!finishedState && opponentName && (
            <h2>You are playing against {opponentName}</h2>
          )}
          {finishedState && finishedState === "opponentLeftMatch" && (
            <h2>Opponent has left</h2>
          )}
        </div>
      </div>
      <div className="resbtn">
        <button onClick={reset} className="resetbtn">
          Reset
        </button>
      </div>
    </div>
  );
};

export default App;
