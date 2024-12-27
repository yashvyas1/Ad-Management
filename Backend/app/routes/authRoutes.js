import express from "express";
import { advertiserRegister, publisherRegister, verifyEmail, updatepassword, login, selectData, updateIsVerified, createAdmin, twoFactAuth, twoFactAuthVerified } from "../controllers/authcontroller.js";
const authRouter = express.Router();

authRouter.route("/advertiser/signup").post(advertiserRegister);
authRouter.route('/verifyemail').get(verifyEmail)
authRouter.route("/publisher/signup").post(publisherRegister);
authRouter.route('/updatepassword').patch(updatepassword)
authRouter.route('/signin').post(login)
authRouter.route('/selected-data').get(selectData);
authRouter.route('/updateisverified').patch(updateIsVerified);
authRouter.route('/createAdmin').post(createAdmin)
authRouter.route('/twofactauth').get(twoFactAuth)
authRouter.route('/twofactauthverified').get(twoFactAuthVerified)

export default authRouter;