import { sequelize } from "../../config/dbconnection.js";
import { DataTypes } from "sequelize";

export const CptRate = sequelize.define('CptRate', {
    cpt_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    cpt_rate: {
      type: DataTypes.INTEGER,
    },
  }, {
    tableName: 'cpt_rate',
    timestamps: true,
  });