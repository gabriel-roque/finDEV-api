const Dev = require('../models/Dev')
const parseStringAsArray = require('../utils/parseStringAsArray')

module.exports = {
  // Search by location ratio 10km and Filter by Techs
  async index(request, response) {
    const { longitude, latitude, techs } = request.query

    const techsArray = parseStringAsArray(techs)

    const devs = await Dev.find({
      // Filter by techs
      techs: {
        // Todo (disable sensitive case)
        $in: techsArray,
      },
      // Filter by location in ratio (10km)
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          // distance in meters
          $maxDistance: 10000,
        },
      },
    })

    return response.json({ devs })
  },
}
