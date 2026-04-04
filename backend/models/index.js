// models/index.js
const fs = require('fs');
const path = require('path');

module.exports = (sequelize) => {
  const basename = path.basename(__filename);
  fs.readdirSync(__dirname)
    .filter(file => (
      file.indexOf('.') !== 0 && 
      file !== basename && 
      file.slice(-3) === '.js'
    ))
    .forEach(file => {
      require(path.join(__dirname, file));
    });
};
