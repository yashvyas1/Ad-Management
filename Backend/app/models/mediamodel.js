import { sequelize } from "../../config/dbconnection.js";
import { DataTypes } from "sequelize";
import { Advertiser } from "./advertisermodel.js";

export const Media = sequelize.define('Media', {
    media_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    advertiser_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Advertiser,
        key: 'advertiser_id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    file_path: {
      type: DataTypes.STRING,
    },
    file_name: {
      type: DataTypes.STRING,
    },
    file_size: {
      type: DataTypes.STRING,
    },
    media_type: {
      type: DataTypes.STRING(255),
    },
    aspect_type: {
      type: DataTypes.STRING
    },
    // media_type: {
    //   type: DataTypes.STRING(255)
    // }
  }, {
    tableName: 'media',
    timestamps: true,
  });
  
  // Define the one-to-many relationship
  Advertiser.hasMany(Media, { foreignKey: 'advertiser_id', onDelete: 'CASCADE', onUpdate: 'CASCADE'});
  Media.belongsTo(Advertiser, { foreignKey: 'advertiser_id'});
  