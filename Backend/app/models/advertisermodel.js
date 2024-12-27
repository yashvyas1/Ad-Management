import { sequelize } from "../../config/dbconnection.js";
import { DataTypes } from "sequelize";
import { Users } from './usersmodel.js';

export const Advertiser = sequelize.define('Advertiser', {
  advertiser_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Users,
      key: 'user_id'
    },
    onDelete: 'CASCADE'
  },
  company_name: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'advertiser'
});

Users.hasOne(Advertiser, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Advertiser.belongsTo(Users, { foreignKey: 'user_id' });
