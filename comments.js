//create web server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
//set up socket.io
var io = require('socket.io')(server);
//set up mysql
var mysql = require('mysql');
var db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'comments'
});

//connect to mysql
db.connect(function(err) {
  if (err) {
    console.log('Error connecting to database');
    return;
  }
  console.log('Connection established');
});

//get all comments from db
function getAllComments(callback) {
  db.query('SELECT * FROM comments', function(err, rows) {
    if (err) {
      console.log('Error getting comments');
      return;
    }
    callback(rows);
  });
}

//add a comment to db
function addComment(comment, callback) {
  db.query('INSERT INTO comments SET ?', comment, function(err, result) {
    if (err) {
      console.log('Error adding comment');
      return;
    }
    callback(result);
  });
}

//set up socket.io
io.on('connection', function(client) {
  console.log('Client connected');
  //when client sends new comment
  client.on('new comment', function(comment) {
    console.log('New comment received');
    //add comment to db
    addComment(comment, function(result) {
      console.log('New comment added to db');
      //get all comments from db
      getAllComments(function(rows) {
        console.log('Sending all comments to clients');
        //send all comments to clients
        io.emit('all comments', rows);
      });
    });
  });
});

//serve static files from public folder
app.use(express.static('public'));

//start server
server.listen(3000, function() {
  console.log('Server listening on port 3000');
});