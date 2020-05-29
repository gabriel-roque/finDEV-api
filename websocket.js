const socketio = require('socket.io');
const parseStringAsArray = require('./utils/parseStringAsArray');
const calculateDistance = require('./utils/calculateDistance');

let io;
const connections = [];
const connectionsBrowser = [];

exports.setupWebsocket = (server) => {
  io = socketio(server);

  io.on('connection', (socket) => {
    const { latitude, longitude, techs } = socket.handshake.query;

    // console.log(`New socket: ${socket.id}`);

    if (!socket.handshake.query.hasOwnProperty('browser')) {
      connections.push({
        id: socket.id,
        coordinates: {
          latitude: Number(latitude),
          longitude: Number(longitude),
        },
        techs: parseStringAsArray(techs),
      });
    } else {
      connectionsBrowser.push({
        id: socket.id,
        techs: [],
      });
    }
    // console.log(connectionsBrowser);
  });
};

exports.findConnections = (coordinates, techs) => {
  return connections.filter((connection) => {
    return (
      calculateDistance(coordinates, connection.coordinates) < 10 &&
      connection.techs.some((item) => techs.includes(item))
    );
  });
};

exports.findConnectionsBrowser = () => connectionsBrowser;

exports.sendMessage = (to, message, data) => {
  to.forEach((connection) => {
    io.to(connection.id).emit(message, data);
  });
};
