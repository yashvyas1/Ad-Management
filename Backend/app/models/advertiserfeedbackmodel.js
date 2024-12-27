import { sequelize } from "../../config/dbconnection.js";
import { DataTypes } from "sequelize";

export const AdvertiserFeedback = sequelize.define('AdvertiserFeedback', {
    feedback_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    advertiser_name: {
      type: DataTypes.STRING
    },
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true,
      },
    },
    feedback_text: {
      type: DataTypes.TEXT,
    },
    response_text: {
      type: DataTypes.TEXT,
      defaultValue: null
    },
  }, {
    tableName: 'advertiser_feedback',
    timestamps: true,
  });