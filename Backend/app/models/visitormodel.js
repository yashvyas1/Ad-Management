import { sequelize } from "../../config/dbconnection.js";
import { DataTypes } from "sequelize";
import { Publisher } from "./publishermodel.js";
import { Website } from "./websitemodel.js";

export const Visitor = sequelize.define('Visitor', {
  visitor_id: {
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
  website_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Website,
      key: 'website_id'
    },
    onDelete: 'CASCADE'
  },
  public_ip_address: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  country: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  device_type: {
    type: DataTypes.ENUM('Mobile','Desktop','Tablet'),
    allowNull: false
  }
}, {
  timestamps: true,
  tableName: 'visitor'
});

Website.hasMany(Visitor, { foreignKey: 'website_id', onDelete: 'CASCADE' });
Visitor.belongsTo(Website, { foreignKey: 'website_id' });

Publisher.hasMany(Visitor, { foreignKey: 'publisher_id', onDelete: 'CASCADE' });
Visitor.belongsTo(Publisher, { foreignKey: 'publisher_id' });
