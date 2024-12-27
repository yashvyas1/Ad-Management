import { sequelize } from "../../config/dbconnection.js";
import { DataTypes } from "sequelize";
import { Publisher } from './publishermodel.js';
import { Campaign } from './campaignmodel.js';

export const CampaignPublisher = sequelize.define('CampaignPublisher', {
  publisher_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Publisher,
      key: 'publisher_id'
    }
  },
  campaign_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Campaign,
      key: 'campaign_id'
    }
  }
}, {
  timestamps: false,
  tableName: 'campaign_publisher_relationship'
});

Publisher.belongsToMany(Campaign, { through: CampaignPublisher, foreignKey: 'publisher_id' });
Campaign.belongsToMany(Publisher, { through: CampaignPublisher, foreignKey: 'campaign_id' });
