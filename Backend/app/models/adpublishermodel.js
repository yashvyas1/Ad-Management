import { sequelize } from "../../config/dbconnection.js";
import { DataTypes } from "sequelize";
import { Publisher } from './publishermodel.js';
import { Ad } from "./adtablemodel.js";

export const AdPublisher = sequelize.define('AdPublisher', {
  publisher_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Publisher,
      key: 'publisher_id'
    }
  },
  ad_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Ad,
      key: 'ad_id'
    }
  }
}, {
  timestamps: false,
  tableName: 'ad_publisher_relationship'
});

Publisher.belongsToMany(Ad, { through: AdPublisher, foreignKey: 'publisher_id' });
Ad.belongsToMany(Publisher, { through: AdPublisher, foreignKey: 'ad_id' });
