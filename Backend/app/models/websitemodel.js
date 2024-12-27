import { sequelize } from "../../config/dbconnection.js";
import { DataTypes } from "sequelize";
import { Publisher } from "./publishermodel.js";

export const Website = sequelize.define('Website', {
  website_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  publisher_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Publisher,
      key: 'publisher_id'
    },
    onDelete: 'CASCADE'
  },
  website_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  website_url: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  allow_category: {
    type: DataTypes.ARRAY(DataTypes.STRING(255)),
    allowNull: false
  },
  disallow_category: {
    type: DataTypes.ARRAY(DataTypes.STRING(255)),
    allowNull: true
  },
  visitor_count: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue:0
  },
  available_position: {
    type: DataTypes.ARRAY(DataTypes.STRING(255)),
    allowNull: true,
    defaultValue: ["right-sidebar"]
  },
  is_verified:{
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive','paused'),
    allowNull: true,
    defaultValue: 'inactive'
  },
}, {
  timestamps: true,
  tableName: 'website'
});

Publisher.hasMany(Website, { foreignKey: 'publisher_id', onDelete: 'CASCADE' });
Website.belongsTo(Publisher, { foreignKey: 'publisher_id' });
