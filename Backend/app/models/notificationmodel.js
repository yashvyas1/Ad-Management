import { sequelize } from "../../config/dbconnection.js";
import { DataTypes } from "sequelize";
import { Users } from "./usersmodel.js";

export const Notification = sequelize.define('Notification', {
    notification_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: Users,
          key: 'user_id',
        },
      },
      allow_notification: {
        type: DataTypes.BOOLEAN,
      },
      email_notification: {   
        type: DataTypes.BOOLEAN,
      },
      login_alert: {
        type: DataTypes.BOOLEAN,
      },
      password_change: {
        type: DataTypes.BOOLEAN,
      },
      two_factor_authentication: {
        type: DataTypes.BOOLEAN,
      },
      payment_due_remainder: {
        type: DataTypes.BOOLEAN,
      },
      payment_confirmation: {
        type: DataTypes.BOOLEAN,
      },
      payment_failure: {
        type: DataTypes.BOOLEAN,
      }
}, {
  timestamps: true,
  tableName: 'notification'
});

Users.hasOne(Notification, { foreignKey: 'user_id' });
Notification.belongsTo(Users, { foreignKey: 'user_id' });
