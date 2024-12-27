import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import { Users } from "../models/usersmodel.js";
import { twoFactAuthMail, verifyEmailMail } from "../../utils/nodemailer.js";
import { Publisher } from "../models/publishermodel.js";
import { sequelize } from "../../config/dbconnection.js";
import { createjwtToken } from "../../utils/jwtUtils.js";
import { Advertiser } from "../models/advertisermodel.js";
import { Keywords } from "../models/keywordsmodel.js";
import { verifyDomain } from "../../utils/customUtils.js";
import { Website } from "../models/websitemodel.js";
import { AdminDetails } from "../models/admindetails.js";

const advertiserRegister = asyncHandler(async (req, res) => {
  const { name, email, password, country, mobileno } = req.body;

  if (!name || !email || !password || !country || !mobileno) {
    return res.status(400).send("All Fields are Required");
  }
  const transaction = await sequelize.transaction();
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const defaults = {
      name: name,
      email: email,
      password: hashedPassword,
      country: country,
      role: "advertiser",
      mobile_no: mobileno,
    };
    const [user, created] = await Users.findOrCreate({
      where: { email: email },
      defaults: defaults,
      transaction,
    });
    if (created) {
      const [advertiser, advertiserCreated] = await Advertiser.findOrCreate({
        where: { user_id: user.user_id },
        defaults: {
          user_id: user.user_id,
        },
        transaction,
      });

      if (advertiserCreated) {
        await transaction.commit();
        const sendMailResponse = await verifyEmailMail(email);
        return res.status(201).json({
          message: "User Created Successfully!",
          OTP: sendMailResponse,
          userId: user.user_id,
          email: user.email,
        });
      } else {
        await transaction.rollback();
        return res.status(400).json({ message: "User Already Exists!" });
      }
    } else {
      await transaction.rollback();
      return res.status(400).json({ message: "User Already Exists!" });
    }
  } catch (err) {
    await transaction.rollback();
    return res
      .status(500)
      .json({ message: "Something went Wrong", error: err.message });
  }
});

const updateIsVerified = asyncHandler(async (req, res) => {
  const userId = req?.query?.userId;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized User" });
  }
  try {
    const user = await Users.findOne({ where: { user_id: userId } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.is_verified = true;
    await user.save();

    const jwtToken = createjwtToken(
      user.user_id,
      user.name,
      user.email,
      user.role
    );
    return res.status(200).json({
      message: "User Successfully Verified",
      token: jwtToken,
      userId: user.user_id,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went Wrong.", error: error.message });
  }
});

const verifyEmail = asyncHandler(async (req, res) => {
  try {
    const email = req.query.email;
    const type = req.query.type;
    if (type == "forgot-password") {
      const user = await Users.findOne({
        where: { email },
      });
      if (!user) {
        return res.status(400).json({ message: "Email does not exist" });
      }
    }
    const sendMailResponse = await verifyEmailMail(email);
    res.status(200).json({ OTP: sendMailResponse });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went Wrong.", error: error.message });
  }
});

const publisherRegister = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    website,
    websitename,
    country,
    mobileno,
    allowcategory,
    disallowcategory,
  } = req.body;

  if (
    !name ||
    !email ||
    !password ||
    !website ||
    !websitename ||
    !country ||
    !mobileno ||
    allowcategory === undefined ||
    disallowcategory === undefined
  ) {
    return res.status(400).send("All Fields are Required");
  }

  const isWebsiteVerified = await verifyDomain(website);
  let isVerified = false;
  let status = "inactive";
  if (isWebsiteVerified) {
    isVerified = true;
    status = "active";
  }

  const transaction = await sequelize.transaction();
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const defaults = {
      name: name,
      email: email,
      password: hashedPassword,
      country: country,
      role: "publisher",
      mobile_no: mobileno,
    };

    const [user, created] = await Users.findOrCreate({
      where: { email: email },
      defaults: defaults,
      transaction,
    });

    if (created) {
      const [publisher, publisherCreated] = await Publisher.findOrCreate({
        where: { user_id: user.user_id },
        defaults: {
          user_id: user.user_id,
        },
        transaction,
      });

      if (publisherCreated) {
        // Check if the website URL already exists
        const existingWebsite = await Website.findOne({
          where: { website_url: website },
          transaction,
        });

        if (existingWebsite) {
          await transaction.rollback();
          return res
            .status(400)
            .json({ message: "Website URL already exists!" });
        }
        let allowedCategories = allowcategory.length === 0 ? [] : allowcategory;
        let disallowedCategories =
          disallowcategory.length === 0 ? [] : disallowcategory;
        const websiteCreated = await Website.create(
          {
            publisher_id: publisher.publisher_id,
            website_name: websitename,
            website_url: website,
            is_verified: isVerified,
            status: status,
            allow_category: allowedCategories,
            disallow_category: disallowedCategories,
          },
          { transaction }
        );
        if (websiteCreated) {
          await transaction.commit();
          const sendMailResponse = await verifyEmailMail(email);
          return res.status(201).json({
            message: "User Created Successfully!",
            OTP: sendMailResponse,
            userId: user.user_id,
            email: user.email,
          });
        } else {
          await transaction.rollback();
          return res.status(400).json({ message: "User Already Exists!" });
        }
      } else {
        await transaction.rollback();
        return res.status(400).json({ message: "User Already Exists!" });
      }
    } else {
      await transaction.rollback();
      return res.status(400).json({ message: "User Already Exists!" });
    }
  } catch (err) {
    await transaction.rollback();
    return res
      .status(500)
      .json({ message: "Something went Wrong", error: err.message });
  }
});

const updatepassword = asyncHandler(async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).send("All Fields are Required");
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [updateCount] = await Users.update(
      { password: hashedPassword },
      { where: { email } }
    );
    res.status(200).json({ message: "Password changed Successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went Wrong.", error: error.message });
  }
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and Password are Required" });
  }
  try {
    const user = await Users.findOne({
      where: { email: email },
    });
    if (!user) {
      return res.status(400).json({ message: "Invalid Email" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Password" });
    }
    if(user.two_factor_authentication) {
      return res.status(200).json({
        message: "Two Factor Authentication Enabled.",
        useremail: user.email,
        user_id: user.user_id,
      });
    }
    if (user.is_verified) {
      const jwtToken = createjwtToken(
        user.user_id,
        user.name,
        user.email,
        user.role
      );
      res.status(200).send({
        message: "Login Successful",
        token: jwtToken,
        userId: user.user_id,
      });
    } else {
      res.status(200).json({
        message: "User Email not Verified.",
        useremail: user.email,
        user_id: user.user_id,
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went Wrong.", error: error.message });
  }
});

const selectData = asyncHandler(async (req, res) => {
  try {
    const keywords = await Keywords.findAll({
      attributes: ["keyword"],
    });
    const data = {
      keywords: keywords.map((keyword) => keyword.keyword),
    };
    res.json({ data });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went Wrong.", error: error.message });
  }
});

const createAdmin = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    country,
    mobile_no,
    org_name,
    designation,
    org_type,
    founding_year,
    member_size,
    logo,
    docs,
  } = req.body;

  // Start a transaction
  const transaction = await sequelize.transaction();

  try {
    // Check if email already exists
    const existingUser = await Users.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with role as 'admin'
    const newUser = await Users.create(
      {
        name,
        email,
        password: hashedPassword,
        country,
        mobile_no,
        role: "admin",
        is_verified: true, // Mark the admin as verified by default
      },
      { transaction }
    );

    // Create the admin details linked to the new user
    const newAdminDetails = await AdminDetails.create(
      {
        user_id: newUser.user_id,
        org_name,
        designation,
        org_type,
        founding_year,
        member_size,
        logo,
        docs,
      },
      { transaction }
    );

    // Commit the transaction if everything is successful
    await transaction.commit();

    return res.status(201).json({
      message: "Admin created successfully",
      user: newUser,
      adminDetails: newAdminDetails,
    });
  } catch (error) {
    // Rollback the transaction in case of error
    await transaction.rollback();
    return res
      .status(500)
      .json({ message: "Something went Wrong", error: error.message });
  }
});

const twoFactAuth = asyncHandler(async (req, res) => {
  try {
    const email = req.query.email
    const user = await Users.findOne({
      where: { email },
    });
    if (!user) {
      return res.status(400).json({ message: "Email does not exist" });
    }
    const sendMailResponse = await twoFactAuthMail(email)
    res.status(200).json({ OTP: sendMailResponse });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong", error: error.message });
  }
})

const twoFactAuthVerified = asyncHandler(async(req, res) => {
  const userId = req?.query?.userId;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized User" });
  }
  try{
    const user = await Users.findOne({ where: { user_id: userId } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const jwtToken = createjwtToken(
      user.user_id,
      user.name,
      user.email,
      user.role
    );
    return res.status(200).json({
      message: "User Successfully Verified",
      token: jwtToken,
      userId: user.user_id,
    });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong", error: error.message });
  }
})

export {
  advertiserRegister,
  verifyEmail,
  publisherRegister,
  updatepassword,
  login,
  selectData,
  updateIsVerified,
  createAdmin,
  twoFactAuth,
  twoFactAuthVerified
};
