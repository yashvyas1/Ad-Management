import { sequelize } from "../../config/dbconnection.js";
import { DataTypes } from "sequelize";
import { Ad } from "./adtablemodel.js";
import { Publisher } from "./publishermodel.js";
import { Website } from "./websitemodel.js";

export const Revenue = sequelize.define('Revenue', {
  revenue_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ad_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Ad,
      key: 'ad_id'
    },
    onDelete: 'CASCADE'
  },
  publisher_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Publisher,
      key: 'publisher_id'
    },
    onDelete: 'CASCADE'
  },
  website_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Website,
      key: 'website_id'
    },
    onDelete: 'CASCADE'
  },
  month: {
    type: DataTypes.STRING,
  },
  year: {
    type: DataTypes.STRING,
  },
  total_click: {
    type: DataTypes.INTEGER,
  },
  total_impression: {
    type: DataTypes.INTEGER,
  },
  click_revenue: {
    type: DataTypes.INTEGER,
  },
  impression_revenue: {
    type: DataTypes.INTEGER,
  },
  total_revenue: {
    type: DataTypes.INTEGER,
  },
  payment_status: {
    type: DataTypes.ENUM('pending','completed'),
    defaultValue: 'pending'
  }
}, {
  timestamps: true,
  tableName: 'revenue',
  indexes: [
    {
      unique: true,
      fields: ['publisher_id', 'website_id', 'ad_id', 'month', 'year'], // Composite uniqueness
    },
  ],
});

Ad.hasMany(Revenue, { foreignKey: 'ad_id', onDelete: 'CASCADE' });
Revenue.belongsTo(Ad, { foreignKey: 'ad_id' });

Publisher.hasMany(Revenue, { foreignKey: 'publisher_id', onDelete: 'CASCADE' });
Revenue.belongsTo(Publisher, { foreignKey: 'publisher_id' });

Website.hasMany(Revenue, { foreignKey: 'website_id', onDelete: 'CASCADE' });
Revenue.belongsTo(Website, { foreignKey: 'website_id' });
