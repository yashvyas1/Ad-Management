import { sequelize } from "../../config/dbconnection.js";
import { DataTypes } from "sequelize";

export const Keywords = sequelize.define('Keywords', {
  category_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }},
  {
    timestamps: true,
    tableName: 'keywords'
  });
  