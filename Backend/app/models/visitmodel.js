import { sequelize } from "../../config/dbconnection.js";
import { DataTypes } from "sequelize";
import { Ad } from "./adtablemodel.js";
import { Publisher } from "./publishermodel.js";
import { Website } from "./websitemodel.js";

export const Visit = sequelize.define('Visit', {
  visit_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  ad_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Ad,
      key: 'ad_id'
    },
    onDelete: 'CASCADE'
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
  visit_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  device_type:{
    type: DataTypes.ENUM('Desktop','Mobile','Tablet'),
    allowNull: false
  }
}, {
  timestamps: true,
  tableName: 'visit'
});

Ad.hasMany(Visit, { foreignKey: 'ad_id', onDelete: 'CASCADE' });
Visit.belongsTo(Ad, { foreignKey: 'ad_id' });

Publisher.hasMany(Visit, { foreignKey: 'publisher_id', onDelete: 'CASCADE' });
Visit.belongsTo(Publisher, { foreignKey: 'publisher_id' });

Website.hasMany(Visit, { foreignKey: 'website_id', onDelete: 'CASCADE' });
Visit.belongsTo(Website, { foreignKey: 'website_id' });
