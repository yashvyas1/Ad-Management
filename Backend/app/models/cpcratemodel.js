import { sequelize } from "../../config/dbconnection.js";
import { DataTypes } from "sequelize";

export const CpcRate = sequelize.define('CpcRate', {
    cpc_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    click_range_min: {
      type: DataTypes.INTEGER,
    },
    click_range_max: {
        type: DataTypes.INTEGER,
      },
    cpc_rate: {
      type: DataTypes.INTEGER,
    },
  }, {
    tableName: 'cpc_rate',
    timestamps: true,
  });