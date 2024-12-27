import { sequelize } from "../../config/dbconnection.js";
import { DataTypes } from "sequelize";
import { Advertiser } from "./advertisermodel.js";

export const Ad = sequelize.define('Ad', {
  ad_id: {
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
  ad_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  ad_category: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  ad_type: {
    type: DataTypes.ENUM('Banner', 'Video'),
    allowNull: false
  },
  file_path: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  ad_budget: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  total_budget: {
    type: DataTypes.INTEGER,
  },
  remaining_budget: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  total_click: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  total_ad_serve_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  banner_size: {
    type: DataTypes.STRING(255),
    allowNull: false,
    defaultValue: "300*600"
  },
  redirect_url: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive','paused','pending'),
    allowNull: false,
    defaultValue: 'pending'
  },
  permission:{
    type: DataTypes.ENUM('approved', 'decline','pending'),
    allowNull: false,
    defaultValue:'pending'
  },
  ad_position: {
    type: DataTypes.ENUM('top-bar', 'bottom-bar', 'left-sidebar', 'right-sidebar'),
    allowNull: false,
    defaultValue:'right-sidebar'
  },
  target_device: {
    type: DataTypes.ARRAY(DataTypes.STRING(255)),
    allowNull: false
  },
  target_country: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  status_manually_changed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false, // False by default, meaning it hasn't been manually changed
  },
  paid: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  upload_count: {
    type: DataTypes.INTEGER    
  }
  
}, {
  timestamps: true,
  tableName: 'ads_table'
});

Advertiser.hasMany(Ad, { foreignKey: 'advertiser_id', onDelete: 'CASCADE'});
Ad.belongsTo(Advertiser, { foreignKey: 'advertiser_id' });
