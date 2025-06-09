// const { render } = require ("ejs");

//const socket = require("websockets/lib/websockets/socket");

const chess = new Chess();
const socket = io(); // connect to the socket server
const boardElement = document.querySelector('.chessBoard')

let draggedPiece = null;
let playerRole = null;
let sourceSquare =null;

const renderBoard = ()=>{
    const board = chess.board(); // create the chess board using the chess.js library   
    boardElement.innerHTML = "" // clear the board element
    board.forEach((row , rowIndex)=>{
        row.forEach((square, squareIndex)=>{
          const sqaredBox = document.createElement('div'); // create a div element for each square
           sqaredBox.classList.add(
             "square",
              (rowIndex + squareIndex) % 2 === 0 ? "light" : "dark" // add light or dark class based on the row and square index
          );
          sqaredBox.dataset.row = rowIndex;        // add data attributes for row and column
          sqaredBox.dataset.column = squareIndex; // add data attributes for row and column
          if (square) {
            const pieceElement = document.createElement("div");
            pieceElement.classList.add(
              "piece",
              square.color === "w" ? "white" : "black"
            ); // add piece class based on the color and type

            pieceElement.innerText = getPieceUniqeCode(square) ; // get the unicode character for the piece type
            pieceElement.draggable = playerRole === square.color; // make the piece draggable only if it is the player's turn
            pieceElement.addEventListener("dragstart", (event) => {
              if (pieceElement.draggable) {
                  draggedPiece = pieceElement; // set the dragged piece to the piece element
                  sourceSquare = { row: rowIndex, column: squareIndex };
                  event.dataTransfer.setData("text/plain", ""); // cross browsers support
              }
            });
            pieceElement.addEventListener("dragend", (e) => {
              // when no one is getting dragged then both are set to null
              draggedPiece = null;
              sourceSquare = null;
            });
            sqaredBox.appendChild(pieceElement); // append the piece element to the square box
            sqaredBox.addEventListener("dragover", (e) => {
              e.preventDefault(); // preventing the piece from being forcefully dragged
            });
            sqaredBox.addEventListener("drop", (e) => {
              e.preventDefault();
              if (draggedPiece) {
                const targetSource = {
                   row: parseInt(sqaredBox.dataset.row),
                   column: parseInt(sqaredBox.dataset.column),
            };
            handelMove(sourceSquare, targetSource);
              }
            });
          }
          boardElement.appendChild(sqaredBox); // append the board to the board element
        });
    })
    if(playerRole==="b"){   // important line of code to flip the board for both players so that no one has same view.
        boardElement.classList.add("flipped");
    }
    else{
        boardElement.classList.remove("flipped");
    }
}  
function getPieceUniqeCode(piece) {  /*because of HOISTING logic in function delcaration this function is declared using 
    functions not const arrow function as it is used before its declaration in renderBoard function*/
  const unicodePieces = {
    p: "♟", r: "♜", n: "♞", b: "♝", q: "♛", k: "♚",
    P: "♙", R: "♖", N: "♘", B: "♗", Q: "♕", K: "♔",
  };
  return unicodePieces[piece.type] || "";
}
renderBoard();
function handelMove (source , target ){
    const move= {
        from :`${String.fromCharCode(97 + source.column)}${8 - source.row}`,
        to:`${String.fromCharCode(97 + target.column)}${8 - target.row}`,
        promotion: "q"
    }
    socket.emit("move", move); // emit the move event to the server
}
socket.on("playerRole" ,function (role){
    playerRole = role;
    renderBoard();
})
socket.on("spectatorRole" , ()=>{
    playerRole = null;
    renderBoard();
})
socket.on("boardState", (eqn)=>{
    chess.load(eqn);
    renderBoard();
})
socket.on("move", (move)=>{
    chess.move(move);  // the move that is played by the user and validated by teh chess.js library
    renderBoard();
})
