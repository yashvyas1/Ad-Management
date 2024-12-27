import { sequelize } from "../../config/dbconnection.js";
import { DataTypes } from "sequelize";
import { Advertiser } from './advertisermodel.js';

export const Campaign = sequelize.define('Campaign', {
  campaign_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  advertiser_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Advertiser,
      key: 'advertiser_id'
    },
    onDelete: 'CASCADE'
  },
  campaign_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  campaign_objective: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  target_location: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  campaign_language: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  campaign_budget: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  campaign_category: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Active', 'Paused', 'Stopped'),
    allowNull: false,
    defaultValue: "Active"
  }
}, {
  timestamps: true,
  tableName: 'campaign'
});

Advertiser.hasMany(Campaign, { foreignKey: 'advertiser_id', onDelete: 'CASCADE' });
Campaign.belongsTo(Advertiser, { foreignKey: 'advertiser_id' });
