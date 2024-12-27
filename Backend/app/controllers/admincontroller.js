import asyncHandler from "express-async-handler";
import geoip from "geoip-lite";
import { Campaign } from "../models/campaignmodel.js";
import { Ad } from "../models/adtablemodel.js";
import { Users } from "../models/usersmodel.js";
import { sequelize } from "../../config/dbconnection.js";
import { Visitor } from "../models/visitormodel.js";
import { Visit } from "../models/visitmodel.js";
import { Click } from "../models/clickmodel.js";
import { col, fn, Model, Op, Sequelize } from "sequelize";
import path from "path";
import { fileURLToPath } from "url";
import { Advertiser } from "../models/advertisermodel.js";
import moment from "moment";
import { weekCustomSort } from "../../utils/customUtils.js";
import { Website } from "../models/websitemodel.js";
import { Publisher } from "../models/publishermodel.js";
import { Keywords } from "../models/keywordsmodel.js";
import { AdvertiserFeedback } from "../models/advertiserfeedbackmodel.js";
import { PublisherFeedback } from "../models/publisherfeedbackmodel.js";
import { feedbackResponseMail } from "../../utils/nodemailer.js";

const getOverview = asyncHandler(async (req, res) => {
  const role = req?.admin?.role;
  if (role !== "admin") {
    return res.status(401).json({ message: "Unauthorized User" });
  }
  try {
    const countResponse = await Users.findAll({
      attributes: [
        [sequelize.fn("COUNT", sequelize.col("user_id")), "totalUsers"],
        [
          sequelize.fn(
            "SUM",
            sequelize.literal(`CASE WHEN role = 'advertiser' THEN 1 ELSE 0 END`)
          ),
          "advertiserCount",
        ],
        [
          sequelize.fn(
            "SUM",
            sequelize.literal(`CASE WHEN role = 'publisher' THEN 1 ELSE 0 END`)
          ),
          "publisherCount",
        ],
      ],
    });
    const advertiserCount = countResponse[0].dataValues.advertiserCount;
    const publisherCount = countResponse[0].dataValues.publisherCount;
    const adCount = await Ad.count({
      where: { status: "active" },
    });
    const adData = await Ad.findAll({
      attributes: [
        [sequelize.fn("SUM", sequelize.col("total_click")), "totalClicks"],
        [
          sequelize.fn("SUM", sequelize.col("total_ad_serve_count")),
          "totalServeCount",
        ],
      ],
      where: { status: "active" },
    });

    const totalClicks = adData[0].dataValues.totalClicks || 0;
    const totalServeCount = adData[0].dataValues.totalServeCount || 0;
    const ctr = totalServeCount > 0 ? (totalClicks / totalServeCount) * 100 : 0;
    const roundedCtr = ctr.toFixed(2);
    res
      .status(200)
      .json({
        advertiserCount,
        publisherCount,
        adCount,
        cpc: 0,
        ctr: roundedCtr,
      });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Something went Wrong.", error: err.message });
  }
});

const getTopWebsites = asyncHandler(async (req, res) => {
  const role = req?.admin?.role;
  if (role !== "admin") {
    return res.status(401).json({ message: "Unauthorized User" });
  }
  try {
    const topWebsites = await Website.findAll({
      attributes: ["website_url", "visitor_count", "website_name"],
      order: [["visitor_count", "DESC"]],
      limit: 10,
    });
    res.status(200).json({ topWebsites });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Something went Wrong.", error: err.message });
  }
});

const getAdCountByCountry = asyncHandler(async (req, res) => {
  const role = req?.admin?.role;
  if (role !== "admin") {
    return res.status(401).json({ message: "Unauthorized User" });
  }
  try {
    const response = await Ad.findAll({
      attributes: [
        "target_country",
        [sequelize.fn("COUNT", sequelize.col("ad_id")), "ad_count"],
      ],
      group: ["target_country"],
      order: [["ad_count", "DESC"]],
    });
    const adCountsByCountry = response.map((ad) => ad.dataValues);
    res.json({ adCountsByCountry }).status(200);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went Wrong.", error: error.message });
  }
});

const getDeviceTypeCount = asyncHandler(async (req, res) => {
  const role = req?.admin?.role;
  if (role !== "admin") {
    return res.status(401).json({ message: "Unauthorized User" });
  }
  try {
    const response = await Visitor.findAll({
      attributes: [
        "device_type",
        [sequelize.fn("COUNT", sequelize.col("visitor_id")), "device_count"],
      ],
      group: ["device_type"],
      order: [["device_count", "DESC"]],
    });
    const deviceTypeCounts = response.map((item) => item.dataValues);
    res.json(deviceTypeCounts).status(200);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went Wrong.", error: error.message });
  }
});

const getCampaignData = asyncHandler(async (req, res) => {
  const role = req?.admin?.role;
  if (role !== "admin") {
    return res.status(401).json({ message: "Unauthorized User" });
  }
  try {
    const campaignDetails = await Campaign.findAll({
      attributes: [
        "campaign_name",
        "campaign_budget",
        [sequelize.fn("SUM", sequelize.col("Ads.total_click")), "total_clicks"],
        [
          sequelize.literal(
            'SUM("Ads"."total_click") / NULLIF(SUM("Ads"."total_ad_serve_count"), 0) * 100'
          ),
          "ctr",
        ],
      ],
      include: [
        {
          model: Ad,
          attributes: [],
        },
      ],
      group: ["Campaign.campaign_id"],
      order: [["campaign_budget", "DESC"]],
      raw: true, // Get raw JSON output
    });
    res.json({ campaignDetails });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went Wrong.", error: error.message });
  }
});

const serveAd = asyncHandler(async (req, res) => {
  const { publisher_id, publicIp, deviceType, website_id } = req.query;
  const userCountry = geoip.lookup(publicIp).country;
  try {
    const website = await Website.findOne({
      where: { website_id },
      attributes: ["allow_category", "disallow_category"],
    });
    await Website.increment("visitor_count", {
      by: 1,
      where: { website_id },
    });
    const { allow_category, disallow_category } = website.dataValues;
    await Visitor.create({
      publisher_id,
      website_id,
      public_ip_address: publicIp,
      country: userCountry,
      device_type: deviceType,
    });
    const ad = await selectAd(
      deviceType,
      userCountry,
      allow_category,
      disallow_category
    );
    if (!ad) {
      return res.status(200).json({ message: "No matching Ads" });
    }
    await Ad.increment("total_ad_serve_count", {
      by: 1,
      where: { ad_id: ad.ad_id },
    });
    await Visit.create({
      ad_id: ad.ad_id,
      publisher_id,
      website_id,
      device_type: deviceType,
      visit_count: 1,
    });
    res.status(200).json({ ad });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went Wrong.", error: error.message });
  }
});

const selectAd = async (
  deviceType,
  userLocation,
  allow_category,
  disallow_category
) => {
  try {
    let categoryCondition = "";
    if (allow_category && allow_category.length > 0) {
      categoryCondition = `ad_category IN (:allowCategory)`;
    } else if (disallow_category && disallow_category.length > 0) {
      categoryCondition = `ad_category NOT IN (:disallowCategory)`;
    } else {
      categoryCondition = `1 = 1`; // No category filtering
    }
    const ads = await sequelize.query(
      `
        SELECT *
        FROM ads_table
        WHERE 
            :deviceType = ANY(target_device::TEXT[])  -- Check if deviceType exists in target_device array
            AND target_country = :userLocation
            AND end_date > :today
            AND start_date <= :today
            AND status = 'active'
            AND ${categoryCondition} 
        ORDER BY ad_budget DESC  -- Sorting based on the highest budget
        LIMIT 1;  -- Limit to the highest priority ad
        `,
      {
        replacements: {
          deviceType: deviceType,
          userLocation: userLocation,
          today: new Date(),
          allowCategory: allow_category.length > 0 ? allow_category : [],
          disallowCategory:
            disallow_category.length > 0 ? disallow_category : [],
        },
        type: sequelize.QueryTypes.SELECT,
      }
    );
    return ads[0];
  } catch (err) {
    console.error("Error:", err.message);
    throw err;
  }
};

const trackClick = asyncHandler(async (req, res) => {
  const { adId, publisherId, website_id, publicIp } = req.query;
  try {

    const lastClicks = await Click.findAll({
      where: { ad_id: adId, publisher_id: publisherId, website_id, ip_address: userIp },
      order: [["createdAt", "DESC"]],
      limit: 5,
    });
    
    if (lastClicks.length >= 2) {
      let totalInterval = 0;
      for (let i = 1; i < lastClicks.length; i++) {
        const currentClickTime = new Date(lastClicks[i - 1].createdAt).getTime();
        const previousClickTime = new Date(lastClicks[i].createdAt).getTime();
        const interval = currentClickTime - previousClickTime;
        totalInterval += interval;
      }
      const averageGap = totalInterval / (lastClicks.length - 1);
    
      const lastClickTime = new Date(lastClicks[0].createdAt).getTime();
      const currentGap = Date.now() - lastClickTime;
    
      const deviation = 5000;
    
      if (currentGap >= averageGap - deviation && currentGap <= averageGap + deviation) {
        return res.status(429).json({ message: "Click Irregularities Found, Please try later." });
      }
    }

    await Ad.increment("total_click", {
      by: 1,
      where: { ad_id: adId },
    });
    await Click.create({
      ad_id: adId,
      publisher_id: publisherId,
      website_id,
      click_count: 1,
      ip_address: publicIp
    });
    const ad = await Ad.findOne({
      where: { ad_id: adId },
      attributes: ["redirect_url"],
    });
    res.redirect(ad.redirect_url);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went Wrong.", error: error.message });
  }
});

const graphData = asyncHandler(async (req, res) => {
  const { filter } = req.query;
  const role = req?.admin?.role;
  if (role !== "admin") {
    return res.status(401).json({ message: "Unauthorized User" });
  }
  try {
    let clicksData, visitsData;
    const now = new Date();
    const todayValue = new Date().getDay();
    if (filter === "week") {
      // Last 7 days for weekly data
      const lastWeek = new Date(now);
      lastWeek.setDate(now.getDate() - 6);
      clicksData = await Click.findAll({
        where: {
          createdAt: {
            [Op.gte]: lastWeek,
          },
        },
        attributes: [
          [sequelize.literal('EXTRACT(DOW FROM "createdAt")'), "groupKey"], // Group by day of the week
          [fn("SUM", col("click_count")), "totalClicks"],
        ],
        group: ["groupKey"],
      });
      visitsData = await Visit.findAll({
        where: {
          createdAt: {
            [Op.gte]: lastWeek,
          },
        },
        attributes: [
          [sequelize.literal('EXTRACT(DOW FROM "createdAt")'), "groupKey"], // Group by day of the week
          [fn("SUM", col("visit_count")), "totalVisits"],
        ],
        group: ["groupKey"],
      });
    } else if (filter === "month") {
      // Last 12 months
      const lastYear = new Date(now);
      lastYear.setFullYear(now.getFullYear() - 1);

      clicksData = await Click.findAll({
        where: {
          createdAt: {
            [Op.gte]: lastYear,
          },
        },
        attributes: [
          [sequelize.literal(`TO_CHAR("createdAt", 'Month')`), "groupKey"], // Group by year-month for PostgreSQL
          [fn("SUM", col("click_count")), "totalClicks"],
        ],
        group: ["groupKey"],
        order: [["groupKey", "DESC"]],
        limit: 12,
      });
      visitsData = await Visit.findAll({
        where: {
          createdAt: {
            [Op.gte]: lastYear,
          },
        },
        attributes: [
          [sequelize.literal(`TO_CHAR("createdAt", 'Month')`), "groupKey"], // Group by year-month for PostgreSQL
          [fn("SUM", col("visit_count")), "totalVisits"],
        ],
        group: ["groupKey"],
        order: [["groupKey", "DESC"]],
      });
    } else if (filter === "year") {
      // Last 10 years
      const lastDecade = new Date(now);
      lastDecade.setFullYear(now.getFullYear() - 10);
      clicksData = await Click.findAll({
        where: {
          createdAt: {
            [Op.gte]: lastDecade,
          },
        },
        attributes: [
          [sequelize.literal('EXTRACT(YEAR FROM "createdAt")'), "groupKey"], // Group by year for PostgreSQL
          [fn("SUM", col("click_count")), "totalClicks"],
        ],
        group: ["groupKey"],
        order: [["groupKey", "DESC"]],
      });
      visitsData = await Visit.findAll({
        where: {
          createdAt: {
            [Op.gte]: lastDecade,
          },
        },
        attributes: [
          [sequelize.literal('EXTRACT(YEAR FROM "createdAt")'), "groupKey"], // Group by year for PostgreSQL
          [fn("SUM", col("visit_count")), "totalVisits"],
        ],
        group: ["groupKey"],
        order: [["groupKey", "DESC"]],
      });
    } else {
      return res
        .status(400)
        .json({
          error: 'Invalid Filter parameter. Use "week", "month", or "year".',
        });
    }
    const dataMap = new Map();
    for (let click of clicksData) {
      const groupKey = click.dataValues.groupKey.trim();
      dataMap.set(groupKey, {
        groupKey: groupKey,
        totalClicks: click.dataValues.totalClicks,
        totalVisits: 0,
      });
    }
    for (let visit of visitsData) {
      const groupKey = visit.dataValues.groupKey.trim();
      if (dataMap.has(groupKey)) {
        dataMap.get(groupKey).totalVisits = visit.dataValues.totalVisits;
      } else {
        dataMap.set(groupKey, {
          groupKey: groupKey,
          totalClicks: 0,
          totalVisits: visit.dataValues.totalVisits,
        });
      }
    }
    let data = Array.from(dataMap.values());
    if (filter == "week") {
      data = weekCustomSort(data, todayValue);
    }
    res.json(data);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went Wrong.", error: error.message });
  }
});

const scriptFile = asyncHandler(async (req, res) => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const rootDir = path.resolve(__dirname, "..", ".."); // Going two levels up
  res.setHeader("Content-Type", "application/javascript");
  res.sendFile(rootDir + "/adscript.js");
});

const getAdvertisementList = asyncHandler(async (req, res) => {
  try {
    const {
      status,
      permission,
      ad_type,
      ad_category,
      start_date,
      end_date,
      updatedAt,
    } = req.query;

    // Build filter object
    const where = {};

    if (status) {
      where.status = status;
    }

    if (permission) {
      where.permission = permission;
    }

    if (ad_type) {
      where.ad_type = ad_type;
    }

    if (ad_category) {
      where.ad_category = ad_category;
    }

    // Convert dates from DD/MM/YYYY to YYYY-MM-DD for comparison with timestamp
    if (start_date && end_date) {
      const startDate = moment(start_date, "YYYY/MM/DD").startOf("day").utcOffset(0, true).toDate();
      const endDate = moment(end_date, "YYYY/MM/DD").endOf("day").utcOffset(0, true).toDate();

      where.start_date = {
        [Op.gte]: startDate, // Ad's start_date is greater than or equal to the provided start_date
      };
      where.end_date = {
        [Op.lte]: endDate, // Ad's end_date is less than or equal to the provided end_date
      };
    }

    if (updatedAt) {
      const startOfDay = moment(updatedAt, "YYYY/MM/DD").startOf("day").utcOffset(0, true).toDate();
      const endOfDay = moment(updatedAt, "YYYY/MM/DD").endOf("day").utcOffset(0, true).toDate();

      where.updatedAt = {
        [Op.between]: [startOfDay, endOfDay], // Match exactly within the given day
      };
    }

    // Query Ads with filters, include Advertiser and Users (for Advertiser's name)
    const ads = await Ad.findAll({
      where,
      include: [
        {
          model: Advertiser,
          include: [
            {
              model: Users, // Get the name from Users table
              attributes: ["name"], // Fetch only the name
            },
          ],
          attributes: ["user_id"],
        },
      ],
      order: [["createdAt", "DESC"]], // Optional: Order by createdAt descending
    });

    // Return the full result without pagination
    return res.status(200).json({
      ads: ads,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went Wrong.", error: error.message });
  }
});

const updateAdPermission = asyncHandler(async (req, res) => {
  const role = req?.admin?.role;
  if (role !== "admin") {
    return res.status(401).json({ message: "Unauthorized User" });
  }
  try {
    const { ad_ids, permission } = req.body;

    // Validate request body
    if (!ad_ids || !Array.isArray(ad_ids) || ad_ids.length === 0) {
      return res
        .status(400)
        .json({ message: "Ad IDs are Required and should be an Array." });
    }
    if (!permission || !["approved", "decline"].includes(permission)) {
      return res
        .status(400)
        .json({
          message:
            'Permission status should be either "approved" or "declined".',
        });
    }

    const updatedAds = await Ad.update(
      { permission: permission }, // Set new permission status
      {
        where: {
          ad_id: {
            [Op.in]: ad_ids, // Match any ad in the list of ad_ids
          },
        },
      }
    );

    return res.status(200).json({
      message: `Successfully Updated ${updatedAds[0]} Ad(s) to ${permission}`,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went Wrong.", error: error.message });
  }
});

const updateAdStatus = asyncHandler(async (req, res) => {
  const role = req?.admin?.role;
  if (role !== "admin") {
    return res.status(401).json({ message: "Unauthorized User" });
  }
  try {
    const { ad_ids, action } = req.body;

    // Validate input
    if (!ad_ids || !Array.isArray(ad_ids) || ad_ids.length === 0) {
      return res
        .status(400)
        .json({ message: "Ad IDs are Required and should be an Array." });
    }
    if (!action || !["pause", "resume", "stop"].includes(action)) {
      return res
        .status(400)
        .json({
          message:
            'Invalid Action. Action should be "pause", "resume", or "stop".',
        });
    }

    if (action === "pause") {
      // Update active ads to paused
      const updatedAds = await Ad.update(
        { status: "paused", status_manually_changed: true }, // Set status to 'paused'
        {
          where: {
            ad_id: {
              [Op.in]: ad_ids,
            },
            status: {
              [Op.ne]: "inactive", // Ignore 'inactive' ads
            },
          },
        }
      );

      return res.status(200).json({
        message: `Successfully Paused ${updatedAds[0]} Ad(s).`,
      });
    }

    if (action === "resume") {
      // Update paused ads to active
      const updatedAds = await Ad.update(
        { status: "active", status_manually_changed: true }, // Set status to 'active'
        {
          where: {
            ad_id: {
              [Op.in]: ad_ids,
            },
            status: {
              [Op.ne]: "inactive", // Ignore 'inactive' ads
            },
          },
        }
      );

      return res.status(200).json({
        message: `Successfully Resumed ${updatedAds[0]} Ad(s).`,
      });
    }

    if (action === "stop") {
      // Update active or paused ads to inactive
      const updatedAds = await Ad.update(
        { status: "inactive", status_manually_changed: true }, // Set status to 'inactive'
        {
          where: {
            ad_id: {
              [Op.in]: ad_ids,
            },
            status: {
              [Op.or]: ["paused", "active"], // Only update 'paused' or 'active' ads
            },
          },
        }
      );

      return res.status(200).json({
        message: `Successfully Stopped ${updatedAds[0]} Ad(s).`,
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went Wrong.", error: error.message });
  }
});

const deleteAds = asyncHandler(async (req, res) => {
  const role = req?.admin?.role;
  if (role !== "admin") {
    return res.status(401).json({ message: "Unauthorized User" });
  }
  try {
    const { ad_ids } = req.body;

    // Validate input
    if (!ad_ids || !Array.isArray(ad_ids) || ad_ids.length === 0) {
      return res
        .status(400)
        .json({ message: "Ad IDs are Required and should be an Array." });
    }

    // Delete ads where the ad_id matches any of the ids in the ad_ids array
    const deletedAds = await Ad.destroy({
      where: {
        ad_id: {
          [Op.in]: ad_ids,
        },
      },
    });

    if (deletedAds === 0) {
      return res
        .status(404)
        .json({ message: "No Ads found for the provided IDs." });
    }

    return res.status(200).json({
      message: `Successfully Deleted ${deletedAds} Ad(s).`,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went Wrong.", error: error.message });
  }
});

const searchAdsByName = asyncHandler(async (req, res) => {
  const role = req?.admin?.role;
  if (role !== "admin") {
    return res.status(401).json({ message: "Unauthorized User" });
  }
  try {
    const { ad_name } = req.query;

    // Validate the query parameter
    if (!ad_name) {
      return res
        .status(400)
        .json({ message: "Ad name is Required for search." });
    }

    // Build the where clause for searching ad name
    const where = {
      ad_name: {
        [Op.iLike]: `${ad_name}%`, // Case-insensitive search
      },
    };

    // Fetch ads and their associated advertiser details
    const ads = await Ad.findAll({
      where,
      include: [
        {
          model: Advertiser,
          include: [
            {
              model: Users, // Get the name from Users table
              attributes: ["name"], // Fetch only the name
            },
          ],
        },
      ],
    });

    if (ads.length === 0) {
      return res
        .status(404)
        .json({ message: "No Ads found with the given Name." });
    }

    return res.status(200).json({
      message: `Ads found for search term "${ad_name}".`,
      ads,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went Wrong.", error: error.message });
  }
});

const getAdInsight = asyncHandler(async (req, res) => {
  const role = req?.admin?.role;
  if (role !== "admin") {
    return res.status(401).json({ message: "Unauthorized User" });
  }
  const { ad_id } = req.query;

  if (!ad_id) {
    return res.status(400).json({ error: "Ad_id is Required" });
  }

  try {
    const visitData = await Visit.findAll({
      where: { ad_id: ad_id },
      attributes: [
        [sequelize.fn("SUM", sequelize.col("visit_count")), "total_visits"],
      ],
      include: [
        {
          model: Publisher,
          attributes: ["publisher_id"],
          include: [
            {
              model: Users,
              attributes: ["name"], // Publisher's name from Users table
            },
          ],
        },
        {
          model: Website,
          attributes: ["website_name", "website_url"], // Website details
        },
        {
          model: Ad,
          attributes: [
            "ad_id",
            "start_date",
            "end_date",
            "createdAt",
            "updatedAt",
          ], // Ad details
        },
      ],
      group: [
        "Visit.ad_id",
        "Visit.publisher_id",
        "Publisher.publisher_id",
        "Publisher->User.user_id",
        "Publisher->User.name",
        "Website.website_id",
        "Ad.ad_id",
      ],
    });

    const clickData = await Click.findAll({
      where: { ad_id: ad_id },
      attributes: [
        [sequelize.fn("SUM", sequelize.col("click_count")), "total_clicks"],
      ],
      include: [
        {
          model: Publisher,
          attributes: ["publisher_id"],
          include: [
            {
              model: Users,
              attributes: ["name"], // Publisher's name from Users table
            },
          ],
        },
        {
          model: Website,
          attributes: ["website_name", "website_url"], // Website details
        },
        {
          model: Ad,
          attributes: [
            "ad_id",
            "start_date",
            "end_date",
            "createdAt",
            "updatedAt",
          ], // Ad details
        },
      ],
      group: [
        "Click.ad_id",
        "Click.publisher_id",
        "Publisher.publisher_id",
        "Publisher->User.user_id",
        "Publisher->User.name",
        "Website.website_id",
        "Ad.ad_id",
      ],
    });

    // Step 3: Combine visit and click data into a single response
    const combinedData = visitData.map((visit) => {
      const matchingClick = clickData.find(
        (click) =>
          click.Ad.ad_id === visit.Ad.ad_id &&
          click.Publisher.publisher_id === visit.Publisher.publisher_id
      );

      return {
        publisher_name: visit.Publisher.User.name,
        website_name: visit.Website.website_name,
        website_url: visit.Website.website_url,
        total_visits: visit.get("total_visits"),
        total_clicks: matchingClick ? matchingClick.get("total_clicks") : 0, // Handle case where there is no matching click
        start_date: visit.Ad.start_date,
        end_date: visit.Ad.end_date,
        createdAt: visit.Ad.createdAt,
        updatedAt: visit.Ad.updatedAt,
      };
    });

    res.json({
      data: combinedData,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went Wrong.", error: error.message });
  }
});

const addCategory = asyncHandler(async (req, res) => {
  const role = req?.admin?.role;
  if (role !== "admin") {
    return res.status(401).json({ message: "Unauthorized User" });
  }
  const {category} = req.body;
  if(!category){
    return res.status(400).json({ message: "Category is required" });
  }
  try {
    // Convert the category to lowercase for case-insensitive comparison
    const categoryLowerCase = category.toLowerCase();

    // Check if the category already exists (case-insensitive)
    const existingCategory = await Keywords.findOne({
      where: {
        category: sequelize.where(
          sequelize.fn('LOWER', sequelize.col('category')), 
          categoryLowerCase
        ),
      },
    });

    if (existingCategory) {
      return res.status(400).json({ message: "Category Already Exists" });
    }

    // Create the new category
    const newCategory = await Keywords.create({
      category: category,
    });

    return res.status(201).json({ message: "Category Created Successfully"});
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong", error: error.message });
  }
})

const getCategory = asyncHandler(async (req, res) => {
  const role = req?.admin?.role;
  if (role !== "admin") {
    return res.status(401).json({ message: "Unauthorized User" });
  }
  try {
    const  categoriesData = await Keywords.findAll({
      order: [['createdAt', 'DESC']]
    });
    return res.status(200).json({categoriesData});

  } catch (error) {
    return res.status(500).json({ message: "Something went wrong", error: error.message });
  }
})

const getAdvertiserFeedback = asyncHandler(async (req, res) => {
  const role = req?.admin?.role;
  if (role !== "admin") {
    return res.status(401).json({ message: "Unauthorized User" });
  }
  try{
    const advertiserFeedbacks = await AdvertiserFeedback.findAll({
      order: [['createdAt', 'DESC']]
    })
    res.status(200).json({advertiserFeedbacks})
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong", error: error.message });
  }
})

const getPublisherFeedback = asyncHandler(async (req, res) => {
  const role = req?.admin?.role;
  if (role !== "admin") {
    return res.status(401).json({ message: "Unauthorized User" });
  }
  try{
    const publisherFeedbacks = await PublisherFeedback.findAll({
      order: [['createdAt', 'DESC']]
    })
    res.status(200).json({publisherFeedbacks})
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong", error: error.message });
  }
})

const feedbackResponse = asyncHandler(async(req, res) => {
  const role = req?.admin?.role;
  if (role !== "admin") {
    return res.status(401).json({ message: "Unauthorized User" });
  }
  const {feedback_id, email, response_text} = req.body
  if(!response_text) {
    return res.status(401).json({ message: "Response cannot be Empty" });
  }
  if(!feedback_id || !email) {
    return res.status(401).json({ message: "Invalid Feedback" });
  }
  try {
    const user = await Users.findOne({
      where: { email },
      attributes: ['role']
    })
    const feedbackOf = user.role
    const Model = feedbackOf == 'advertiser' ? AdvertiserFeedback : PublisherFeedback
    const feedback = await Model.findOne({
      where: {feedback_id}
    })
    await feedbackResponseMail(feedback.dataValues, response_text)
    const result = await Model.update(
      { response_text: response_text }, 
      { where: { feedback_id } } 
    );
    res.status(200).json({message: 'Response Sent Successfully'})
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong", error: error.message });
  }
})

const getAdminReport = asyncHandler(async (req, res) => {
  const role = req?.admin?.role;
  if (role !== "admin") {
    return res.status(401).json({ message: "Unauthorized User" });
  }

  // Destructure filters from the request query
  const { status, ad_type, ad_category, permission, start_date, end_date } = req.query;
    
  // Build a dynamic filter object based on provided filters
  const whereClause = {};
  if (status) whereClause.status = status;
  if (ad_type) whereClause.ad_type = ad_type;
  if (ad_category) whereClause.ad_category = ad_category;
  if (permission) whereClause.permission= permission;
  // Convert dates from DD/MM/YYYY to YYYY-MM-DD for comparison with timestamp
  if (start_date && end_date) {
    const startDate = moment(start_date, "YYYY/MM/DD").startOf("day").utcOffset(0, true).toDate();
    const endDate = moment(end_date, "YYYY/MM/DD").endOf("day").utcOffset(0, true).toDate();

    whereClause.start_date = {
      [Op.gte]: startDate, // Ad's start_date is greater than or equal to the provided start_date
    };
    whereClause.end_date = {
      [Op.lte]: endDate, // Ad's end_date is less than or equal to the provided end_date
    };
  }

  try {
    const visitData = await Visit.findAll({
      
      attributes: [
        [sequelize.fn("SUM", sequelize.col("visit_count")), "total_visits"],
      ],
      include: [
        {
          model: Publisher,
          attributes: ["publisher_id"],
          include: [
            {
              model: Users,
              attributes: ["name"], // Publisher's name from Users table
            },
          ],
        },
        {
          model: Website,
          attributes: ["website_name", "website_url"], // Website details
        },
        {
          model: Ad,
          attributes: [
            "ad_id",
            "start_date",
            "end_date",
            "createdAt",
            "updatedAt",
            "ad_name",
            "ad_category",
            "ad_budget",
            "status",
            "permission",
            "ad_type",
            "target_device"
          ],
          where: whereClause,
          include:[
            {
              model:Advertiser,
              include:[
                {
                  model: Users,
                  attributes: ["name"]
                }
              ]
            }
          ]
        },
      ],
      group: [
        "Visit.ad_id",
        "Visit.publisher_id",
        "Publisher.publisher_id",
        "Publisher->User.user_id",
        "Publisher->User.name",
        "Website.website_id",
        "Website.website_name",
        "Website.website_url",
        "Ad.ad_id",
        "Ad.start_date",
        "Ad.end_date",
        "Ad.createdAt",
        "Ad.updatedAt",
        "Ad.ad_name",
        "Ad.ad_category",
        "Ad.ad_budget",
        "Ad.status",
        "Ad.permission",
        "Ad.ad_type",
        "Ad.target_device",
        "Ad->Advertiser.advertiser_id",
        "Ad->Advertiser->User.user_id",
        "Ad->Advertiser->User.name"
      ],
    });

    const clickData = await Click.findAll({
     
      attributes: [
        [sequelize.fn("SUM", sequelize.col("click_count")), "total_clicks"],
      ],
      include: [
        {
          model: Publisher,
          attributes: ["publisher_id"],
          include: [
            {
              model: Users,
              attributes: ["name"], // Publisher's name from Users table
            },
          ],
        },
        {
          model: Website,
          attributes: ["website_name", "website_url"], // Website details
        },
        {
          model: Ad,
          attributes: [
            "ad_id",
            "start_date",
            "end_date",
            "createdAt",
            "updatedAt",
            "ad_name",
            "ad_category",
            "ad_budget",
            "status",
            "permission",
            "ad_type",
            "target_device"
          ],
          where: whereClause,
          include:[
            {
              model:Advertiser,
              include:[
                {
                  model: Users,
                  attributes: ["name"]
                }
              ]
            }
          ]
        },
      ],
      group: [
        "Click.ad_id",
        "Click.publisher_id",
        "Publisher.publisher_id",
        "Publisher->User.user_id",
        "Publisher->User.name",
        "Website.website_id",
        "Website.website_name",
        "Website.website_url",
        "Ad.ad_id",
        "Ad.start_date",
        "Ad.end_date",
        "Ad.createdAt",
        "Ad.updatedAt",
        "Ad.ad_name",
        "Ad.ad_category",
        "Ad.ad_budget",
        "Ad.status",
        "Ad.permission",
        "Ad.ad_type",
        "Ad.target_device",
        "Ad->Advertiser.advertiser_id",
        "Ad->Advertiser->User.user_id",
        "Ad->Advertiser->User.name"
      ],
    });

    // Step 3: Combine visit and click data into a single response
    const combinedData = visitData.map((visit) => {
      const matchingClick = clickData.find(
        (click) =>
          click.Ad.ad_id === visit.Ad.ad_id &&
          click.Publisher.publisher_id === visit.Publisher.publisher_id
      );

      return {
        advertiser_name: visit.Ad.Advertiser.User.name,
        publisher_name: visit.Publisher.User.name,
        website_name: visit.Website.website_name,
        website_url: visit.Website.website_url,
        total_visits: visit.get("total_visits"),
        total_clicks: matchingClick ? matchingClick.get("total_clicks") : 0, // Handle case where there is no matching click
        start_date: visit.Ad.start_date,
        end_date: visit.Ad.end_date,
        createdAt: visit.Ad.createdAt,
        updatedAt: visit.Ad.updatedAt,
        Ad_name: visit.Ad.ad_name,
        Ad_category: visit.Ad.ad_category,
        Ad_budget: visit.Ad.ad_budget,
        Status: visit.Ad.status,
        Permission: visit.Ad.permission,
        Ad_type: visit.Ad.ad_type,
        Device: visit.Ad.target_device,
        CTR: Math.floor(((matchingClick ? matchingClick.get("total_clicks") : 0)/visit.get("total_visits"))*100),
        CPC: 0
      };
    });

    res.json({
      data: combinedData,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went Wrong.", error: error.message });
  }
});

const getAdsAnalytics = asyncHandler(async (req, res) =>{
  try {

    // Destructure filters from the request query
    const { status, ad_type, ad_category, start_date, end_date } = req.query;
    
    // Build a dynamic filter object based on provided filters
    const whereClause = {};
    if (status) whereClause.status = status;
    if (ad_type) whereClause.ad_type = ad_type;
    if (ad_category) whereClause.ad_category = ad_category;
    
    // Convert dates from DD/MM/YYYY to YYYY-MM-DD for comparison with timestamp
    if (start_date && end_date) {
      const startDate = moment(start_date, "YYYY/MM/DD").startOf("day").utcOffset(0, true).toDate();
      const endDate = moment(end_date, "YYYY/MM/DD").endOf("day").utcOffset(0, true).toDate();

      whereClause.start_date = {
        [Op.gte]: startDate, // Ad's start_date is greater than or equal to the provided start_date
      };
      whereClause.end_date = {
        [Op.lte]: endDate, // Ad's end_date is less than or equal to the provided end_date
      };
    }

    const ads = await Ad.findAll({
      attributes:[
        'ad_name',
        'ad_category',
        'status',
        'start_date',
        'end_date',
        'total_click',
        'total_ad_serve_count',
        [
          Sequelize.literal(`
            CASE 
              WHEN total_ad_serve_count > 0 
              THEN FLOOR(CAST(total_click AS FLOAT) / total_ad_serve_count * 100) 
              ELSE 0 
            END
          `),
          'CTR'
        ],
        'ad_type'
      ],
      where: whereClause,
      include:[
        {
          model:Advertiser,
          attributes:[],
          include:[{
            model:Users,
            attributes:['name']
          }]
        }
      ],
      raw: true
    })
      // Send response with ad data
      res.status(200).json({ads});
  }catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
});

const getAllPublishersDetails = async (req, res) => {
  try {
    const publishers = await Publisher.findAll({
      include: [
        {
          model: Users,
          attributes: ['name', 'email', 'mobile_no']
        },
        {
          model: Website,
          attributes: [
            'website_name', 
            'website_url', 
            'allow_category', 
            'is_verified', 
            'createdAt', 
            'updatedAt'
          ]
        }
      ],
      attributes: [
        'bank_name', 
        'branch_name', 
        'account_holder_name', 
        'IFSC_code', 
        'account_number', 
        'createdAt', 
        'updatedAt'
      ]
    });

    res.status(200).json({
      data: publishers
    });
  } catch (error) {
    res.status(500).json({
      message: 'Something went wrong',
      error: error.message
    });
  }
};

const getAllAdvertiserDetails = asyncHandler(async (req, res) => {
  try {
    const advertisers = await Advertiser.findAll({
      attributes: [
        'advertiser_id',
        [sequelize.col('User.name'), 'advertiser_name'],
        [sequelize.col('User.email'), 'email'],
        [sequelize.col('User.mobile_no'), 'mobile_no'],
        [sequelize.col('User.createdAt'), 'createdAt'],
        [sequelize.col('User.updatedAt'), 'updatedAt'],
        [sequelize.fn('COUNT', sequelize.col('Ads.ad_id')), 'total_ads_count']
      ],
      include: [
        {
          model: Users,
          attributes: [], // Exclude other fields as they're already selected
          required: true
        },
        {
          model: Ad,
          attributes: [], // Only count the ads, so no need to retrieve full data
          required: false
        }
      ],
      group: ['Advertiser.advertiser_id', 'User.user_id'],
      raw: true
    });

    return res.status(200).json(advertisers);
  } catch (error) {
    console.error('Error fetching advertiser details:', error);
    return res.status(500).json({ error: 'An error occurred while fetching advertiser details' });
  }
});

const profileSettings = asyncHandler(async(req, res) => {
  const role = req?.admin?.role;
  const user_id = req?.admin?.user_id
  if (role !== "admin" || !user_id) {
    return res.status(401).json({ message: "Unauthorized User" });
  }
  try {
    const userDetails = await Users.findOne({
      where: {user_id},
      attributes: ['user_id', 'name', 'email', 'country', 'mobile_no', 'image']
    })
    res.json({userDetails}).status(200)
  } catch (error) {
    res.status(500).json({ message: 'Something went Wrong.', error: error.message })
  }
})

const updateProfilePicture = asyncHandler(async(req, res) => {
  const role = req?.admin?.role;
  const user_id = req?.admin?.user_id
  if (role !== "admin" || !user_id) {
    return res.status(401).json({ message: "Unauthorized User" });
  }
  try {
    const image = req.file.location
    await Users.update(
      {image: image},
      {where: {user_id}}
    )
    res.json({message: "Profile Picture Updated Successsfully"})
  } catch (error) {
    res.status(500).json({ message: 'Something went Wrong.', error: error.message })
  }
})

const updateUserDetails = asyncHandler(async (req, res) => {
  const role = req?.admin?.role;
  const user_id = req?.admin?.user_id
  if (role !== "admin" || !user_id) {
    return res.status(401).json({ message: "Unauthorized User" });
  }
  try{
    const name = req.body.name
    const email = req.body.email
    const mobile_no = req.body.mobileno
    const country = req.body.country
    if(!name || !email || !mobile_no || !country) {
        return res.status(400).json({ message: "All fields are required" });
    }
    await Users.update(
      { name, email, mobile_no, country},
      {where: {user_id}}
    )
    res.status(200).json({message: "Details Updated Successfully"})
  } catch (error) {
    res.status(500).json({ message: 'Something went Wrong.', error: error.message })
  }
})

export {  
  getOverview,
  getTopWebsites,
  getAdCountByCountry,
  getDeviceTypeCount,
  getCampaignData,
  serveAd,
  trackClick,
  graphData,
  scriptFile,
  getAdvertisementList,
  updateAdPermission,
  updateAdStatus,
  deleteAds,
  searchAdsByName,
  getAdInsight,
  addCategory,
  getCategory,
  getAdvertiserFeedback,
  getPublisherFeedback,
  feedbackResponse,
  getAdminReport,
  getAdsAnalytics,
  getAllPublishersDetails,
  getAllAdvertiserDetails,
  profileSettings,
  updateProfilePicture,
  updateUserDetails
};
