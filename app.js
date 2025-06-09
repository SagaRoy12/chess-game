const express = require('express');
const app = express();
const http = require('http')
const socketIo = require('socket.io');  
const {Chess} = require('chess.js');
const path = require('path');
const port =  3000; 

// ejs setup
app.set('view engine', 'ejs'); // set the view engine to ejs
app.use(express.static(path.join(__dirname, 'public'))); // serve static files from the public directory
app.use(express.json()); // parse JSON bodies
// server setup and connection to 
const server = http.createServer(app)  // create a server using the express app
const io = socketIo(server) // creating a socket server and passing the express server in it
const chessGame = new Chess();

let players = {}
let currentPlayer = "w" // current player who joins first gets white pieces

// rendering the index page
app.get('/' , (req , res)=>{
    res.render('index' , {title: 'play the chess'}) // render the index.ejs file when the root URL is accessed
})

io.on('connection' , (uniqueSocketVal)=>{
    console.log(`connected ${uniqueSocketVal.id}`);
    if(!players.white){
        players.white = uniqueSocketVal.id // assign the first player to white
        uniqueSocketVal.emit("playerRole" , "white") // emit the player color to the first player
    }else if(!players.black){
        players.black = uniqueSocketVal.id // assign the second player to black
        uniqueSocketVal.emit("playerRole" , "black") // emit the player color to the second player
    }
    else{
        uniqueSocketVal.emit("spectator") // emit the spectator event to any additional players
    }

    // player disconnection handeling
    uniqueSocketVal.on('disconnect' , ()=>{
        if(uniqueSocketVal.id === players.white){
            console.log(`player ${uniqueSocketVal.id} is  disconnected`)
            delete players.white // remove the white player from the players object
        }
        else if(uniqueSocketVal.id === players.black){
            delete players.black // remove the black player from the players object
        }
    })

    //move event handelling
    uniqueSocketVal.on('move' , (movement)=>{
       try{
        if(chessGame.turn()==='b' && uniqueSocketVal.id ===players.white){
            return; //if in the mean time while other player is trying to move then the peice wont move and get back to its original position
        }
        else if(chessGame.turn()==='w' && uniqueSocketVal.id ===players.black){
            return;
        }else{
            const result = chessGame.move(movement); // make the move using the chess.js library
            if(result){
                currentPlayer = chessGame.turn(); // update the current player;
                io.emit('move' , movement); // emit the move to all connected clients
                io.emit('chess-board-state' , chessGame.fen()); // emit the current state of the chess board to all connected clients
            }else{
                console.log(`wrong move ${movement}`)
                uniqueSocketVal.emit("invalidMove" , movement); // emit the invalid move event to the player who made the wrong move
            }
        }

    }
    catch(error){
    uniqueSocketVal.emit("invalidMove" , movement); // emit the invalid move event to the player who made the wrong move
    console.log(`invalid move ${movement}`)
    }
    })
})
server.listen(port, () => {
    console.log(`Server is running on port ${port}`); // log the server port to the console
})