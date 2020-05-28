module.exports = parseStringAsArray = stringAsArray =>
  stringAsArray.split(',').map(tech => tech.trim())
