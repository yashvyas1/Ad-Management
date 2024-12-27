import express from "express";
import validateToken from "../middleware/validatejwt.js";
import { addCategory, deleteAds, feedbackResponse, getAdCountByCountry, getAdInsight, getAdminReport, getAdsAnalytics, getAdvertisementList, getAdvertiserFeedback, getAllAdvertiserDetails, getAllPublishersDetails, getCampaignData, getCategory, getDeviceTypeCount, getOverview, getPublisherFeedback, getTopWebsites, graphData, profileSettings, scriptFile, searchAdsByName, serveAd, trackClick, updateAdPermission, updateAdStatus, updateProfilePicture, updateUserDetails } from "../controllers/admincontroller.js";
import multer from "multer";
import path from 'path';
import { S3Client } from "@aws-sdk/client-s3";
import multerS3 from "multer-s3";
const adminRouter = express.Router();

const s3 = new S3Client({
    region: process.env.AWSREGION,
    credentials: {
      accessKeyId: process.env.AWSACCESS,
      secretAccessKey: process.env.AWSSECRET,
    },
});
  
const upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: process.env.AWSBUCKET,
      metadata: (req, file, cb) => {
        cb(null, { fieldName: file.fieldname });
      },
      key: (req, file, cb) => {
        cb(null, Date.now().toString() + path.extname(file.originalname)); 
      },
    }),
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and MP4 are allowed.'), false);
      }
    },
});

adminRouter.route('/overview').get(validateToken, getOverview)
adminRouter.route('/topwebsites').get(validateToken, getTopWebsites)
adminRouter.route('/adcountbycountry').get(validateToken, getAdCountByCountry)
adminRouter.route('/devicetypecount').get(validateToken, getDeviceTypeCount)
adminRouter.route('/campaigndetails').get(validateToken, getCampaignData)
adminRouter.route('/getad').get(serveAd)
adminRouter.route('/trackclick').get(trackClick)
adminRouter.route('/impressionsgraph').get(validateToken, graphData)
adminRouter.route('/ad-script.js').get(scriptFile)
adminRouter.route('/getAdvertisementList').get(validateToken,getAdvertisementList)
adminRouter.route('/updateAdPermission').patch(validateToken,updateAdPermission)
adminRouter.route('/updateAdStatus').patch(validateToken,updateAdStatus)
adminRouter.route('/deleteAds').delete(validateToken,deleteAds)
adminRouter.route('/searchAdsByName').get(validateToken,searchAdsByName)
adminRouter.route('/getAdInsight').get(validateToken,getAdInsight)
adminRouter.route('/addcategory').post(validateToken,addCategory)
adminRouter.route('/getcategory').get(validateToken,getCategory)
adminRouter.route('/getadvertiserfeedback').get(validateToken, getAdvertiserFeedback)
adminRouter.route('/getpublisherfeedback').get(validateToken, getPublisherFeedback)
adminRouter.route('/feedbackresponse').post(validateToken, feedbackResponse)
adminRouter.route('/getAdminReport').get(validateToken,getAdminReport)
adminRouter.route('/getAdsAnalytics').get(validateToken,getAdsAnalytics)
adminRouter.route('/getAllPublishersDetails').get(validateToken,getAllPublishersDetails)
adminRouter.route('/getAllAdvertiserDetails').get(validateToken,getAllAdvertiserDetails)
adminRouter.route('/profilepage').get(validateToken, profileSettings)
adminRouter.route('/updatepicture').post(validateToken, upload.single('profileImage'), updateProfilePicture)
adminRouter.route('/updatedetails').post(validateToken, updateUserDetails)

export default adminRouter

