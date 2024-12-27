import express from "express";
import validateToken from "../middleware/validatejwt.js";
import { adRevenue, adRevenueExport, deleteWebsite, generateScript, websiteListExport, getDeviceTypes, getOverview, adGraphData, websiteGraphData, websiteList, updateWebsiteStatus, searchWebsiteByName, addWebsite, addFeedback, accountSettings, updatePayment, profileSettings, updateProfilePicture, updateUserDetails } from "../controllers/publishercontroller.js";
import multer from "multer";
import path from 'path';
import { S3Client } from "@aws-sdk/client-s3";
import multerS3 from "multer-s3";
const publisherRouter = express.Router();

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

publisherRouter.route('/generatescript').get(validateToken ,generateScript)
publisherRouter.route('/overview').get(validateToken, getOverview)
publisherRouter.route('/devicecount').get(validateToken, getDeviceTypes)
publisherRouter.route('/adgraph').get(validateToken, adGraphData)
publisherRouter.route('/websitegraph').get(validateToken, websiteGraphData)
publisherRouter.route('/adrevenue').get(validateToken ,adRevenue)
publisherRouter.route('/deletewebsite').delete(validateToken ,deleteWebsite)
publisherRouter.route('/exportadrevenue').get(validateToken ,adRevenueExport)
publisherRouter.route('/websitelist').get(validateToken ,websiteList)
publisherRouter.route('/exportwebsitelist').get(validateToken ,websiteListExport)
publisherRouter.route('/updatewebsitesatatus').patch(validateToken ,updateWebsiteStatus)
publisherRouter.route('/searchwebsitesbyname').get(validateToken ,searchWebsiteByName)
publisherRouter.route('/addwebsite').post(validateToken ,addWebsite)
publisherRouter.route('/feedback').post(validateToken, addFeedback)
publisherRouter.route('/accountspage').get(validateToken, accountSettings)
publisherRouter.route('/updatepaymentinfo').post(validateToken, updatePayment)
publisherRouter.route('/profilepage').get(validateToken, profileSettings)
publisherRouter.route('/updatepicture').post(validateToken, upload.single('profileImage'), updateProfilePicture)
publisherRouter.route('/updatedetails').post(validateToken, updateUserDetails)

export default publisherRouter