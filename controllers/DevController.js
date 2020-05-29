const axios = require('axios');
const Dev = require('../models/Dev');
const parseStringAsArray = require('../utils/parseStringAsArray');
const {
  findConnections,
  findConnectionsBrowser,
  sendMessage,
} = require('../websocket');

module.exports = {
  async index(request, response) {
    const devs = await Dev.find();
    return response.json(devs);
  },

  async store(request, response) {
    const { github_username, techs, latitude, longitude } = request.body;

    let dev = await Dev.findOne({ github_username });

    if (!dev) {
      const apiResponse = await axios.get(
        `https://api.github.com/users/${github_username}`
      );

      const { name = login, avatar_url, bio } = apiResponse.data;

      const techsArray = parseStringAsArray(techs);

      const location = {
        type: 'Point',
        coordinates: [longitude, latitude],
      };

      dev = await Dev.create({
        name,
        github_username,
        bio,
        avatar_url,
        techs: techsArray,
        location,
      });

      // Filter new dev for notification socket
      let sendSocketMessageTo = findConnections(
        { latitude, longitude },
        techsArray
      );

      let clientsBrowsers = findConnectionsBrowser();

      sendSocketMessageTo = [...sendSocketMessageTo, ...clientsBrowsers];

      // console.log(sendSocketMessageTo);

      sendMessage(sendSocketMessageTo, 'new-dev', dev);
    }

    return response.json(dev);
  },

  async update(request, response) {
    let { github_username } = request.params;

    const filter = { github_username };
    const update = request.body;

    let dev = await Dev.findOneAndUpdate(filter, update);

    if (dev === null) dev = { status: '404', msg: 'User not found' };

    return await response.json(dev);
  },

  async destroy(request, response) {
    let { github_username } = request.params;

    let dev = await Dev.findOneAndDelete({ github_username });

    if (dev === null) dev = { status: '404', msg: 'User not found' };

    return await response.json(dev);
  },
};
