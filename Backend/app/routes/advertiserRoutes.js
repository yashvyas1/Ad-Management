import express from "express";
import validateToken from "../middleware/validatejwt.js";
import { accountSettings, addFeedback, adGraphData, createAd, createCampaign, deleteAds, getAdList, getCampaignList, getDeviceTypeCounts, getOverview, getTopAds, profile, searchAdsByName, selectData, updateAdStatus, updateProfilePicture, updateUserDetails } from "../controllers/advertisercontroller.js";
import multer from "multer";
import path from 'path';
import { S3Client } from "@aws-sdk/client-s3";
import multerS3 from "multer-s3";

const advertiserRouter = express.Router();

const s3 = new S3Client({
  region: process.env.AWSREGION,
  credentials: {
    accessKeyId: process.env.AWSACCESS,
    secretAccessKey: process.env.AWSSECRET,
  },
});

// Configure multer to use S3 for file uploads
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWSBUCKET,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      cb(null, Date.now().toString() + path.extname(file.originalname)); // Unique file name
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

advertiserRouter.route('/create-ad').post(validateToken, upload.single('adFile'), createAd);
advertiserRouter.route('/create-campaign').post(validateToken, createCampaign);
advertiserRouter.route('/selected-data').get(selectData);
advertiserRouter.route('/getCampaignList').get(validateToken, getCampaignList);
advertiserRouter.route('/overview').get(validateToken, getOverview)
advertiserRouter.route('/topads').get(validateToken, getTopAds)
advertiserRouter.route('/devicetypes').get(validateToken, getDeviceTypeCounts)
advertiserRouter.route('/impressiongraph').get(validateToken, adGraphData)
advertiserRouter.route('/getadlist').get(validateToken, getAdList);
advertiserRouter.route('/searchadsbyname').get(validateToken, searchAdsByName);
advertiserRouter.route('/deleteads').delete(validateToken, deleteAds);
advertiserRouter.route('/updateadstatus').patch(validateToken, updateAdStatus);
advertiserRouter.route('/feedback').post(validateToken, addFeedback)
advertiserRouter.route('/accountspage').get(validateToken, accountSettings)
advertiserRouter.route('/profilepage').get(validateToken, profile)
advertiserRouter.route('/updatepicture').post(validateToken, upload.single('profileImage'), updateProfilePicture)
advertiserRouter.route('/updatedetails').post(validateToken, updateUserDetails)

export default advertiserRouter;