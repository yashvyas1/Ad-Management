import { AdminDetails } from "./admindetails.js";
import { AdPublisher } from "./adpublishermodel.js";
import { Ad } from "./adtablemodel.js";
import { AdvertiserFeedback } from "./advertiserfeedbackmodel.js";
import { Advertiser } from "./advertisermodel.js";
import { Campaign } from "./campaignmodel.js";
import { CampaignPublisher } from "./campaignpublishermodel.js";
import { Click } from "./clickmodel.js";
import { CpcRate } from "./cpcratemodel.js";
import { CptRate } from "./cptratemodel.js";
import { Keywords } from "./keywordsmodel.js";
import { Media } from "./mediamodel.js";
import { Notification } from "./notificationmodel.js";
import { PublisherFeedback } from "./publisherfeedbackmodel.js";
import { Publisher } from "./publishermodel.js";
import { Users } from "./usersmodel.js";
import { Visit } from "./visitmodel.js";
import { Visitor } from "./visitormodel.js";
import { Website } from "./websitemodel.js";

const SyncModel = async () => {
    try{
        await Users.sync({ alter: true });
        await Advertiser.sync({ alter: true });
        await Publisher.sync({ alter: true });
        await AdminDetails.sync({ alter: true });
        await Campaign.sync({ alter: true });
        await Ad.sync({ alter: true });
        await CampaignPublisher.sync({ alter: true });
        await Keywords.sync({ alter: true });
        await Website.sync({alter: true}); 
        await Click.sync({ alter: true });
        await Visit.sync({ alter: true });
        await Visitor.sync({ alter: true });
        await AdPublisher.sync({ alter: true });
        await Media.sync({alter: true});
        await AdvertiserFeedback.sync({ alter: true });
        await PublisherFeedback.sync({ alter: true });
        await Notification.sync({ alter: true });
        await CpcRate.sync({ alter: true });
        await CptRate.sync({ alter: true });

    }catch (error) {
        console.error("Error during database sync:", error);
    }
    
};

 export default SyncModel;


