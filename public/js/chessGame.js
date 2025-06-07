const socket = io();
const chess = new Chess()
const boardElemnt = document.querrySelector('.chessBoard')

let draggedPiece = null;
let playerRolevv = null;
let sourceSquare =null;

const renderBoard = ()=>{
    const board = chess.board(); // create the chess board using the chess.js library   
    boardElement.innerHTMl = "" // clear the board element
    board.forEach((row , rowIndex)=>{
        row.forEach((square, squareIndex)=>{
          const sqaredBox =   document.createEmlement('div') // create a div element for each square
            squaredBox.classList.add("square" , 
                (rowIndex + squareIndex)%2 === 0 ? "light" : "dark" // add light or dark class based on the row and square index
            );
            squaredBox.dataset.row = rowIndex;        // add data attributes for row and column
            squaredBox.dataset.column = squareIndex; // add data attributes for row and column
            if(square){
                const pieceElment  = document.createElement("div");
                pieceElement.classList.add ("piece" , square.color === "w" ? "white" : "black"); // add piece class based on the color and type
            }
            pieceElement.innerText = ""
            pieceElement.draggable = playerRole === square.color // make the piece draggable only if it is the player's turn
            pieceElement.addEventListner("dragstart" , (event)=>{
                
            })
        })
    })
}