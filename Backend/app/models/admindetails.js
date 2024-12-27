import { sequelize } from "../../config/dbconnection.js";
import { DataTypes } from "sequelize";
import { Users } from './usersmodel.js';

export const AdminDetails = sequelize.define('Admin', {
  admin_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  user_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Users,
      key: 'user_id'
    },
    onDelete: 'CASCADE'
  },
  org_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  designation: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  org_type: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  founding_year: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  member_size: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  logo: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  docs: {
    type: DataTypes.STRING(255),
    allowNull: false
  }
}, {
  timestamps: true,
  tableName: 'admin_details'
});

Users.hasOne(AdminDetails, { foreignKey: 'user_id', onDelete: 'CASCADE' });
AdminDetails.belongsTo(Users, { foreignKey: 'user_id' });
