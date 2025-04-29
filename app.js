const express = require('express');
const app = express();
const http = require('http')
const socketIo = require('socket.io');  
const { createServer } = require('http');
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
let currentPlayer = "W" // current player who joins first gets white pieces

// rendering the index page
app.get('/' , (req , res)=>{
    res.render('index' , {title: 'play the chess'}) // render the index.ejs file when the root URL is accessed
})

io.on('connection' , (uniqueSocketVal)=>{
    console.log(`connected`)
})
server.listen(port, () => {
    console.log(`Server is running on port ${port}`); // log the server port to the console
})