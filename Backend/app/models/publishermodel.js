import { sequelize } from "../../config/dbconnection.js";
import { DataTypes } from "sequelize";
import { Users } from './usersmodel.js';

export const Publisher = sequelize.define('Publisher', {
  publisher_id: {
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
  logo: {
    type: DataTypes.STRING(255)
  },
  bank_name: {
    type: DataTypes.STRING(255)
  },
  branch_name: {
    type: DataTypes.STRING(255)
  },
  account_number: {
    type: DataTypes.STRING(255)
  },
  account_holder_name: {
    type: DataTypes.STRING(255)
  },
  IFSC_code: {
    type: DataTypes.STRING(255)
  }
}, {
  timestamps: true,
  tableName: 'publishers'
});

Users.hasOne(Publisher, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Publisher.belongsTo(Users, { foreignKey: 'user_id' });
