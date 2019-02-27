'use strict';
module.exports = (sequelize, DataTypes) => {
  const Folder = sequelize.define("Folder", {
    path: {//previous name: "path"
      type: DataTypes.TEXT
    },
    ownerId: {//previous name: "path"
      type: DataTypes.TEXT
    }
  },
  {
    indexes: [
      {
        unique: true,
        fields: ['path', 'ownerId']
      }
    ]
  });
  return Folder;
};