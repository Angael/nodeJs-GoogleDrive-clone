'use strict';
module.exports = (sequelize, DataTypes) => {
  const File = sequelize.define("File", {
    originalName: {//previous name: "path"
      type: DataTypes.TEXT
    },
    generatedName: {//previous name: "path"
      type: DataTypes.TEXT
    },
    dir: {
      type: DataTypes.TEXT
    },
    ownerId: {
      type: DataTypes.TEXT
    }
  });
  return File;
};