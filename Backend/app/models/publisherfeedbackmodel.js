import { sequelize } from "../../config/dbconnection.js";
import { DataTypes } from "sequelize";

export const PublisherFeedback = sequelize.define('PublisherFeedback', {
    feedback_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    publisher_name: {
      type: DataTypes.STRING,
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
    tableName: 'publisher_feedback',
    timestamps: true,
  });