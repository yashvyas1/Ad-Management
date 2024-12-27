import { sequelize } from "../../config/dbconnection.js";
import { DataTypes } from "sequelize";

export const Users = sequelize.define('User', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  two_factor_authentication: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  country: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  mobile_no: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  is_verified:{
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  role: {
    type: DataTypes.ENUM('advertiser', 'publisher', 'admin'),
    allowNull: false
  },
  image: {
    type: DataTypes.STRING(255)
  }
}, {
  timestamps: true,
  tableName: 'users'
});
