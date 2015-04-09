#!/usr/bin/env node

/**
 * Module dependencies.
 */

var config = require('./config.json');
var dataRoot = config.dataRoot;
var port = config.port;

var fs = require('fs');
var path = require('path');

var app = require('./app');
var debug = require('debug')('effteepee:server');
var http = require('http');

/**
 * Get port from environment and store in Express.
 */

app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 *
 * Socket.io setup
 */
var Files = {};
var io = require('socket.io').listen(server);
io.sockets.on('connection', function (socket) {

  socket.on('Start', function (data) { //data contains the variables that we passed through in the html file
    var Name = data['Name'];
    Files[Name] = {  //Create a new Entry in The Files Variable
      FileSize: data['Size'],
      Data: "",
      Downloaded: 0,
      Dir: data['Dir']
    };
    var Place = 0;
    var outPath = path.join(dataRoot, Files[Name].Dir, Name);
    try {
      var Stat = fs.statSync(outPath);
      if (Stat.isFile()) {
        Files[Name]['Downloaded'] = Stat.size;
        Place = Stat.size / 524288;
      }
    }
    catch (er) {
    } //It's a New File
    fs.open(outPath, "a", 0755, function (err, fd) {
      if (err) {
        console.log(err);
      }
      else {
        Files[Name]['Handler'] = fd; //We store the file handler so we can write to it later
        socket.emit('MoreData', {'Place': Place, Percent: 0});
      }
    });
  });
  socket.on('Upload', function (data) {
    var Name = data['Name'];
    Files[Name]['Downloaded'] += data['Data'].length;
    Files[Name]['Data'] += data['Data'];
    if (Files[Name]['Downloaded'] == Files[Name]['FileSize']) //If File is Fully Uploaded
    {
      fs.write(Files[Name]['Handler'], Files[Name]['Data'], null, 'Binary', function (err, Writen) {
        if (err) {
          console.log('error!', err);
        }

        socket.emit('Complete');
      });
    }
    else if (Files[Name]['Data'].length > 10485760) { //If the Data Buffer reaches 10MB
      fs.write(Files[Name]['Handler'], Files[Name]['Data'], null, 'Binary', function (err, Writen) {
        if (err) {
          console.log('error!', err);
        }
        Files[Name]['Data'] = ""; //Reset The Buffer
        var Place = Files[Name]['Downloaded'] / 524288;
        var Percent = (Files[Name]['Downloaded'] / Files[Name]['FileSize']) * 100;
        socket.emit('MoreData', {'Place': Place, 'Percent': Percent});
      });
    }
    else {
      var Place = Files[Name]['Downloaded'] / 524288;
      var Percent = (Files[Name]['Downloaded'] / Files[Name]['FileSize']) * 100;
      socket.emit('MoreData', {'Place': Place, 'Percent': Percent});
    }
  });
});


/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
