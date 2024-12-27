import { sequelize } from "../../config/dbconnection.js";
import { DataTypes } from "sequelize";
import { Ad } from "./adtablemodel.js";
import { Publisher } from "./publishermodel.js";
import { Website } from "./websitemodel.js";

export const Click = sequelize.define('Click', {
  click_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  ad_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Ad,
      key: 'ad_id'
    },
    onDelete: 'CASCADE'
  },
  publisher_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Publisher,
      key: 'publisher_id'
    },
    onDelete: 'CASCADE'
  },
  website_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Website,
      key: 'website_id'
    },
    onDelete: 'CASCADE'
  },
  ip_address: {
    type: DataTypes.STRING
  },
  click_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  }
}, {
  timestamps: true,
  tableName: 'click'
});

Ad.hasMany(Click, { foreignKey: 'ad_id', onDelete: 'CASCADE' });
Click.belongsTo(Ad, { foreignKey: 'ad_id' });

Publisher.hasMany(Click, { foreignKey: 'publisher_id', onDelete: 'CASCADE' });
Click.belongsTo(Publisher, { foreignKey: 'publisher_id' });

Website.hasMany(Click, { foreignKey: 'website_id', onDelete: 'CASCADE' });
Click.belongsTo(Website, { foreignKey: 'website_id' });
