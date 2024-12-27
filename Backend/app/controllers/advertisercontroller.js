import asyncHandler from "express-async-handler";
import { Campaign } from "../models/campaignmodel.js";
import { Ad } from "../models/adtablemodel.js";
import { Advertiser } from "../models/advertisermodel.js";
import { sequelize } from "../../config/dbconnection.js";
import { Visit } from "../models/visitmodel.js";
import { Click } from "../models/clickmodel.js";
import { col, fn, Op } from "sequelize";
import { verifyDomain, weekCustomSort } from "../../utils/customUtils.js";
import moment from "moment";
import { Keywords } from "../models/keywordsmodel.js";
import { Users } from "../models/usersmodel.js";
import { AdvertiserFeedback } from "../models/advertiserfeedbackmodel.js";

const selectData = asyncHandler(async (req, res) => {
  try {
    const [categories] = await Promise.all([
      Keywords.findAll({
        attributes: ["category"],
      })
    ]);

    const data = {
      categories: categories,
    };
    let category = []
    data.categories.forEach((item) => {
      category.push(item.category)
    })
    res.json({ category });
  } catch (error) {
    res.status(500).json({ message: 'Something went Wrong.', error: error.message })
  }
});

const createAd = asyncHandler(async (req, res) => {
  try {
    const user_id = req?.advertiser?.user_id;
    if (!user_id) {
      return res.status(401).json({ message: 'Unauthorized User' })
    }
    const {
      adType,
      adName,
      // bannerSize,
      // bannerPosition,
      category,
      country,
      startDate,
      endDate,
      budget,
      targetURL,
    } = req.body;
    let devices = req.body.devices; // Expecting devices as an array
    const adFile = req.file;
    devices = JSON.parse(devices);

    const isUrlVerified = await verifyDomain(targetURL);
    if (!isUrlVerified) {
      return res.status(400).json({ message: "Target URL is not verified" })
    }

    if (!adType || !adName || !category || !devices || !country || !startDate || !endDate || !budget || !targetURL || !adFile) {
      return res.status(400).json({ message: "All fields are required" });
    }

  // Check if the ad name already exists
    const existingAd = await Ad.findOne({
      where: { ad_name: adName },
    });
  
    if (existingAd) {
      return res.status(400).json({ message: "Ad Name already exists!" });
    }

    const advertiserRecord = await Advertiser.findOne({
      where: { user_id },
      attributes: ['advertiser_id'],
    });
    if (!advertiserRecord) {
      return res.status(404).json({ message: "Advertiser not found" });
    }
    const { advertiser_id } = advertiserRecord;
    const fileUrl = adFile.location;

    const startDateTime = moment(startDate, 'DD-MM-YYYY hh:mm A');
    const endDateTime = moment(endDate, 'DD-MM-YYYY hh:mm A');

    if (!startDateTime.isValid() || !endDateTime.isValid()) {
      return res.status(400).json({ message: "Invalid start or end date" });
    }

    const formattedStartDateTime = startDateTime.format('YYYY-MM-DD HH:mm:ss');
    const formattedEndDateTime = endDateTime.format('YYYY-MM-DD HH:mm:ss');

    await Ad.create({
      advertiser_id: advertiser_id,
      ad_name: adName,
      ad_category: category,
      // banner_size: bannerSize,
      // ad_position: bannerPosition,
      ad_type: adType,
      ad_budget: budget,
      start_date: formattedStartDateTime,
      end_date: formattedEndDateTime,
      file_path: fileUrl,
      target_device: devices,
      target_country: country,
      // keyword: keywords,
      redirect_url: targetURL,
    });

    res.status(201).json({
      message: "Ad created Successfully",
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      // Handle unique constraint error
      res.status(400).json({ message: 'Ad Name already exists!' });
    } else {
      res.status(500).json({ message: 'Something went Wrong.', error: error.message });
    }
  }
});

const createCampaign = asyncHandler(async (req, res) => {
  try {
    const {
      user_id,
      campaign_name,
      campaign_objective,
      target_location,
      campaign_language,
      campaign_budget,
      campaign_category,
      status,
    } = req.body;

    if (!user_id || !campaign_name || !campaign_objective || !target_location || !campaign_language || !campaign_budget || !campaign_category) {
      return res.status(400).json({ message: "All fields are Required" });
    }

    // Fetch the advertiser_id based on the provided user_id
    const advertiser = await Advertiser.findOne({
      where: { user_id: user_id },
    });

    // If advertiser does not exist for the given user_id, return a 404 response
    if (!advertiser) {
      return res
        .status(404)
        .json({ message: "Advertiser not found for the provided user_id" });
    }

    // Create a new campaign using the fetched advertiser_id
    await Campaign.create({
      advertiser_id: advertiser.advertiser_id, // Use the fetched advertiser_id
      campaign_name,
      campaign_objective,
      target_location,
      campaign_language,
      campaign_budget,
      campaign_category,
      status, // Optional as the default is "Active"
    });

    return res.status(201).json({
      message: "Campaign created Successfully",
    });
  } catch (error) {
    res.status(500).json({ message: 'Something went Wrong.', error: error.message })
  }
});

const getCampaignList = asyncHandler(async (req, res) => {
  const { start_date, status, page = 1 } = req.query; // Get filters and page from query parameters
  const limit = 10; // Rows per page
  const offset = (page - 1) * limit; // Pagination offset

  try {
    const whereClause = {};

    // Apply filters based on start_date and status
    if (start_date) {
      // Parse the start_date from DD-MM-YYYY format to YYYY-MM-DD
      const [day, month, year] = start_date.split("-");
      const formattedDate = new Date(`${year}-${month}-${day}`);

      // Use Sequelize where clause to compare dates without time
      whereClause.createdAt = {
        [sequelize.Op.gte]: formattedDate, // Filter createdAt on or after the start date
        [sequelize.Op.lt]: new Date(formattedDate.getTime() + 24 * 60 * 60 * 1000), // Add 1 day to include all entries for that day
      };
    }
    if (status) {
      whereClause.status = status;
    }

    // Fetch campaigns with aggregated clicks, total ads, and apply pagination
    const campaignDetails = await Campaign.findAndCountAll({
      where: whereClause,
      attributes: [
        "campaign_id",
        "campaign_name",
        [
          sequelize.fn(
            "to_char",
            sequelize.col("Campaign.createdAt"),
            "DD-MM-YYYY" // Return createdAt in format 21-09-2024
          ),
          "Start Date"
        ],
        "status",
        "campaign_budget",
        [sequelize.fn("SUM", sequelize.col("Ads.total_click")), "total_clicks"],
        [sequelize.fn("COUNT", sequelize.col("Ads.ad_id")), "total_ads"],
      ],
      include: [
        {
          model: Ad,
          attributes: [],
        },
      ],
      group: ["Campaign.campaign_id"], // Group by campaign ID
      order: [["campaign_budget", "DESC"]], // Sort by budget
      limit,
      offset,
      raw: true, // Get raw JSON output
      subQuery: false,
    });

    // Calculate total pages based on count
    const totalPages = Math.ceil(campaignDetails.count.length / limit); // Adjusted to handle grouped count

    res.status(200).json({
      data: campaignDetails.rows, // The actual campaigns with ads count and clicks
      pagination: {
        totalRecords: campaignDetails.count.length, // Adjusted to handle grouped count
        totalPages,
        currentPage: page,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Something went Wrong.', error: error.message })
  }
});

const getOverview = asyncHandler(async (req, res) => {
  const user_id = req?.advertiser?.user_id;
  if (!user_id) {
    return res.status(401).json({ message: 'Unauthorized User' })
  }
  const advertiser = await Advertiser.findOne({
    where: { user_id },
    attributes: ['advertiser_id']
  })
  const advertiser_id = advertiser.dataValues.advertiser_id
  try {
    const adCount = await Ad.count({
      where: { advertiser_id }
    })
    const activeAdCount = await Ad.count({
      where: {
        advertiser_id,
        status: 'active'
      }
    })
    const resultClick = await Ad.findOne({
      where: { advertiser_id: advertiser_id },
      attributes: [[sequelize.fn('SUM', sequelize.col('total_click')), 'totalClicks']],
    });
    const totalClicks = resultClick.dataValues.totalClicks == null ? 0 : resultClick.dataValues.totalClicks
    const resultVisit = await Ad.findOne({
      where: { advertiser_id: advertiser_id },
      attributes: [[sequelize.fn('SUM', sequelize.col('total_ad_serve_count')), 'totalVisits']],
    });
    const totalVisits = resultVisit.dataValues.totalVisits == null ? 0 : resultVisit.dataValues.totalVisits
    const ctr = totalVisits == 0 ? 0 : totalClicks / totalVisits * 100
    const roundedCtr = ctr.toFixed(2);
    res.status(200).json({ adCount, activeAdCount, totalCpc: 0, totalCtr: roundedCtr })
  } catch (error) {
    res.status(500).json({ message: 'Something went Wrong.', error: error.message })
  }
})

const getTopAds = asyncHandler(async (req, res) => {
  const user_id = req?.advertiser?.user_id;
  if (!user_id) {
    return res.status(401).json({ message: 'Unauthorized User' })
  }
  const advertiser = await Advertiser.findOne({
    where: { user_id },
    attributes: ['advertiser_id']
  })
  const advertiser_id = advertiser.dataValues.advertiser_id
  try {
    const topAds = await Ad.findAll({
      where: { advertiser_id },
      order: [['total_click', 'DESC']],
      limit: 10,
      attributes: ['ad_name', 'file_path', 'total_click']
    })
    res.status(200).json({ topAds })
  } catch (error) {
    res.status(500).json({ message: 'Something went Wrong.', error: error.message })
  }
})

const getDeviceTypeCounts = asyncHandler(async (req, res) => {
  const user_id = req?.advertiser?.user_id;
  if (!user_id) {
    return res.status(401).json({ message: 'Unauthorized User' })
  }
  const advertiser = await Advertiser.findOne({
    where: { user_id },
    attributes: ['advertiser_id']
  })
  const advertiser_id = advertiser.dataValues.advertiser_id
  try {
    const results = await Visit.findAll({
      include: [
        {
          model: Ad,
          attributes: [],
          include: [
            {
              model: Advertiser,
              attributes: [],
              where: { advertiser_id },
            },
          ],
        },
      ],
      attributes: [
        'device_type',
        [sequelize.fn('SUM', sequelize.col('visit_count')), 'totalVisitCount'],
      ],
      group: ['device_type'],
    });

    const deviceTypes = results.map(result => ({
      device_type: result.device_type,
      device_count: result.dataValues.totalVisitCount,
    }));
    res.json({ deviceTypes })
  } catch (error) {
    res.status(500).json({ message: 'Something went Wrong.', error: error.message })
  }
})

const adGraphData = asyncHandler(async (req, res) => {
  const user_id = req?.advertiser?.user_id;
  if (!user_id) {
    return res.status(401).json({ message: 'Unauthorized User' })
  }
  const advertiser = await Advertiser.findOne({
    where: { user_id },
    attributes: ['advertiser_id']
  })
  const advertiser_id = advertiser.dataValues.advertiser_id
  const { filter } = req.query;
  if (!advertiser_id && !filter) {
    return res.status(400).json({ message: "Filter and Advertiser Id is needed." })
  }
  try {
    let clicksData, visitsData
    const now = new Date();
    const todayValue = new Date().getDay()
    if (filter === 'week') {
      // Last 7 days for weekly data
      const lastWeek = new Date(now);
      lastWeek.setDate(now.getDate() - 6);
      clicksData = await Click.findAll({
        include: [
          {
            model: Ad,
            attributes: [],
            where: { advertiser_id },
          },
        ],
        where: {
          createdAt: { [Op.gte]: lastWeek }
        },
        attributes: [
          [sequelize.literal('EXTRACT(DOW FROM "Click"."createdAt")'), 'groupKey'], // Group by day of the week
          [fn('SUM', col('click_count')), 'totalClicks']
        ],
        group: ['groupKey']
      });
      visitsData = await Visit.findAll({
        include: [
          {
            model: Ad,
            attributes: [],
            where: { advertiser_id },
          },
        ],
        where: {
          createdAt: { [Op.gte]: lastWeek }
        },
        attributes: [
          [sequelize.literal(('EXTRACT(DOW FROM "Visit"."createdAt")')), 'groupKey'], // Group by day of the week
          [fn('SUM', col('visit_count')), 'totalVisits']
        ],
        group: ['groupKey'],
      });
    } else if (filter === 'month') {
      // Last 12 months
      const lastYear = new Date(now);
      lastYear.setFullYear(now.getFullYear() - 1);

      clicksData = await Click.findAll({
        include: [
          {
            model: Ad,
            attributes: [],
            where: { advertiser_id },
          },
        ],
        where: {
          createdAt: { [Op.gte]: lastYear }
        },
        attributes: [
          [sequelize.literal(`TO_CHAR("Click"."createdAt", 'Month')`), 'groupKey'], // Group by year-month for PostgreSQL
          [fn('SUM', col('click_count')), 'totalClicks']
        ],
        group: ['groupKey'],
        order: [['groupKey', 'DESC']],
        limit: 12
      });
      visitsData = await Visit.findAll({
        include: [
          {
            model: Ad,
            attributes: [],
            where: { advertiser_id },
          },
        ],
        where: {
          createdAt: { [Op.gte]: lastYear }
        },
        attributes: [
          [sequelize.literal(`TO_CHAR("Visit"."createdAt", 'Month')`), 'groupKey'], // Group by year-month for PostgreSQL
          [fn('SUM', col('visit_count')), 'totalVisits']
        ],
        group: ['groupKey'],
        order: [['groupKey', 'DESC']]
      });
    } else if (filter === 'year') {
      // Last 10 years
      const lastDecade = new Date(now);
      lastDecade.setFullYear(now.getFullYear() - 10);
      clicksData = await Click.findAll({
        include: [
          {
            model: Ad,
            attributes: [],
            where: { advertiser_id },
          },
        ],
        where: {
          createdAt: {
            [Op.gte]: lastDecade
          }
        },
        attributes: [
          [sequelize.literal('EXTRACT(YEAR FROM "Click"."createdAt")'), 'groupKey'], // Group by year for PostgreSQL
          [fn('SUM', col('click_count')), 'totalClicks']
        ],
        group: ['groupKey'],
        order: [['groupKey', 'DESC']]
      });
      visitsData = await Visit.findAll({
        include: [
          {
            model: Ad,
            attributes: [],
            where: { advertiser_id },
          },
        ],
        where: {
          createdAt: {
            [Op.gte]: lastDecade
          }
        },
        attributes: [
          [sequelize.literal('EXTRACT(YEAR FROM "Visit"."createdAt")'), 'groupKey'], // Group by year for PostgreSQL
          [fn('SUM', col('visit_count')), 'totalVisits']
        ],
        group: ['groupKey'],
        order: [['groupKey', 'DESC']]
      });
    } else {
      return res.status(400).json({ error: 'Invalid filter parameter. Use "week", "month", or "year".' });
    }
    const dataMap = new Map();
    for (let click of clicksData) {
      const groupKey = click.dataValues.groupKey.trim();
      dataMap.set(groupKey, {
        groupKey: groupKey,
        totalClicks: click.dataValues.totalClicks,
        totalVisits: 0
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
          totalVisits: visit.dataValues.totalVisits
        });
      }
    }
    let data = Array.from(dataMap.values());
    if (filter == 'week') {
      data = weekCustomSort(data, todayValue)
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Something went Wrong.', error: error.message })
  }
})

const getAdList = asyncHandler(async (req, res) => {
  const { status, adType, categories, startDate, endDate, updateDate } = req.query;
  const user_id = req?.advertiser?.user_id;
  if (!user_id) {
    return res.status(401).json({ message: 'Unauthorized User' })
  }
  try {
    const advertiser = await Advertiser.findOne({
      where: { user_id },
      attributes: ['advertiser_id']
    })
    const advertiser_id = advertiser.dataValues.advertiser_id;
    let whereClause = { advertiser_id };
    // Check and add filters dynamically to whereClause if present
    if (status) {
      whereClause.status = status; // Add status to where clause
    }
    if (adType) {
      whereClause.ad_type = adType; // Add adType to where clause
    }
    if (categories) {
      whereClause.ad_category = categories; // Add categories to where clause
    }
    // Check for date ranges (startDate and endDate)
    if (startDate && endDate) {
      const formatedStartDate = moment(startDate, 'YYYY/MM/DD').startOf('day').utcOffset(0, true).toDate(); // Start of the day (00:00:00)
      const formatedEndDate = moment(endDate, 'YYYY/MM/DD').endOf('day').utcOffset(0, true).toDate(); // End of the day (23:59:59)

      whereClause.start_date = {
        [Op.gte]: formatedStartDate, // Greater than or equal to start of the day
      };
      whereClause.end_date = {
        [Op.lte]: formatedEndDate, // Less than or equal to end of the day
      };
    }
    if (updateDate) {
      const startOfDay = moment(updateDate, 'YYYY/MM/DD').startOf('day').utcOffset(0, true).toDate();
      const endOfDay = moment(updateDate, 'YYYY/MM/DD').endOf('day').utcOffset(0, true).toDate();      
      whereClause.updatedAt = {
        [Op.between]: [startOfDay, endOfDay] // Match exactly within the given day
      };
  }
    const data = await Ad.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']], // Optional: Sort the results by creation date
    })
    res.status(200).json({ data })
  } catch (error) {
    res.status(500).json({ message: 'Something went Wrong.', error: error.message })
  }
})

const searchAdsByName = asyncHandler(async (req, res) => {
  try {
    const { ad_name } = req.query;
    const user_id = req?.advertiser?.user_id;
    if (!user_id) {
      return res.status(401).json({ message: 'Unauthorized User' })
    }
    const advertiser = await Advertiser.findOne({
      where: { user_id },
      attributes: ['advertiser_id']
    })
    const advertiser_id = advertiser.dataValues.advertiser_id;

    // Validate the query parameter
    if (!ad_name) {
      return res.status(200).json({ message: 'Ad name is required for search.' });
    }

    // Build the where clause for searching ad name
    const whereClause = {
      advertiser_id: advertiser_id,
      ad_name: {
        [Op.iLike]: `${ad_name}%`, // Case-insensitive search
      },
    };

    // Fetch ads and their associated advertiser details
    const ads = await Ad.findAll({
      where: whereClause,
    })

    if (ads.length === 0) {
      return res.status(200).json({ message: 'No ads found with the given name.' });
    }

    return res.status(200).json({
      message: `Ads found for search term "${ad_name}".`,
      ads,
    });
  } catch (error) {
    console.error('Error searching ads by name:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

const deleteAds = asyncHandler(async (req, res) => {
  try {
    const { ad_ids } = req.body;
    const user_id = req?.advertiser?.user_id;
    if (!user_id) {
      return res.status(401).json({ message: 'Unauthorized User' })
    }
    const advertiser = await Advertiser.findOne({
      where: { user_id },
      attributes: ['advertiser_id']
    })
    const advertiser_id = advertiser.dataValues.advertiser_id;

    // Validate input
    if (!ad_ids || !Array.isArray(ad_ids) || ad_ids.length === 0) {
      return res.status(400).json({ message: 'Ad IDs are required and should be an array.' });
    }

    // Delete ads where the ad_id matches any of the ids in the ad_ids array
    const deletedAds = await Ad.destroy({
      where: {
        advertiser_id: advertiser_id,
        ad_id: {
          [Op.in]: ad_ids,
        },
      },
    });

    if (deletedAds === 0) {
      return res.status(404).json({ message: 'No ads found for the provided IDs.' });
    }

    return res.status(200).json({
      message: `Successfully Deleted ${deletedAds} Ad(s).`,
    });
  } catch (error) {
    res.status(500).json({ message: 'Something went Wrong.', error: error.message })
  }
})

const updateAdStatus = asyncHandler(async (req, res) => {
  try {
    const { ad_ids, action } = req.body;
    const user_id = req?.advertiser?.user_id;
    if (!user_id) {
      return res.status(401).json({ message: 'Unauthorized User' })
    }
    const advertiser = await Advertiser.findOne({
      where: { user_id },
      attributes: ['advertiser_id']
    })
    const advertiser_id = advertiser.dataValues.advertiser_id;

    // Validate input
    if (!ad_ids || !Array.isArray(ad_ids) || ad_ids.length === 0) {
      return res.status(400).json({ message: 'Ad IDs are Required and should be an Array.' });
    }
    if (!action || !['pause', 'resume', 'stop'].includes(action)) {
      return res.status(400).json({ message: 'Invalid Action. Action should be "pause", "resume", or "stop".' });
    }

    if (action === 'pause') {
      // Update active ads to paused
      const updatedAds = await Ad.update(
        { status: 'paused', status_manually_changed: true },  // Set status to 'paused'
        {
          where: {
            advertiser_id: advertiser_id,
            ad_id: {
              [Op.in]: ad_ids,
            },
            status: {
              [Op.ne]: 'inactive',  // Ignore 'inactive' ads
            },
          },
        }
      );

      return res.status(200).json({
        message: `Successfully Paused ${updatedAds[0]} Ad(s).`,
      });
    }

    if (action === 'resume') {
      // Update paused ads to active
      const updatedAds = await Ad.update(
        { status: 'active', status_manually_changed: true },  // Set status to 'active'
        {
          where: {
            advertiser_id: advertiser_id,
            ad_id: {
              [Op.in]: ad_ids,
            },
            status: {
              [Op.ne]: 'inactive',  // Ignore 'inactive' ads
            },
          },
        }
      );

      return res.status(200).json({
        message: `Successfully Resumed ${updatedAds[0]} Ad(s).`,
      });
    }

    if (action === 'stop') {
      // Update active or paused ads to inactive
      const updatedAds = await Ad.update(
        { status: 'inactive', status_manually_changed: true },  // Set status to 'inactive'
        {
          where: {
            advertiser_id: advertiser_id,
            ad_id: {
              [Op.in]: ad_ids,
            },
            status: {
              [Op.or]: ['paused', 'active'],  // Only update 'paused' or 'active' ads
            },
          },
        }
      );
      return res.status(200).json({
        message: `Successfully Stopped ${updatedAds[0]} Ad(s).`,
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Something went Wrong.', error: error.message })
  }
})

const addFeedback = asyncHandler( async(req, res) => {
  const user_id = req?.advertiser?.user_id;
  const feedbackText = req.body.feedback
  if (!user_id) {
    return res.status(401).json({ message: 'Unauthorized User' })
  }
  if (!feedbackText) {
    return res.status(401).json({ message: 'Feedback cannot be Empty' })
  }
  try {
    const advertiser = await Users.findOne({
      where: { user_id },
      attributes: ['name', 'email']
    })
    const advertiser_name = advertiser.dataValues.name;
    const email = advertiser.dataValues.email
    await AdvertiserFeedback.create({
      advertiser_name: advertiser_name,
      email: email,
      feedback_text: feedbackText
    })
    res.status(200).json({message: 'Feedback sent successfully'})
  } catch (error) {
    res.status(500).json({ message: 'Something went Wrong.', error: error.message })
  }
})

const profile = asyncHandler(async (req, res) => {
  const user_id = req?.advertiser?.user_id;
  if (!user_id) {
    return res.status(401).json({ message: 'Unauthorized User' })
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

const updateProfilePicture = asyncHandler( async (req, res) => {
  const user_id = req?.advertiser?.user_id;
  if (!user_id) {
    return res.status(401).json({ message: 'Unauthorized User' })
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

const updateUserDetails = asyncHandler(async(req, res) => {
  const user_id = req?.advertiser?.user_id;
  if (!user_id) {
    return res.status(401).json({ message: 'Unauthorized User' })
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

const accountSettings = asyncHandler( async (req, res) => {
  const user_id = req?.advertiser?.user_id;
  if (!user_id) {
    return res.status(401).json({ message: 'Unauthorized User' })
  }
  try {
    const userDetails = await Users.findOne({ where: {user_id}})
    const country = userDetails.country
    res.json({country}).status(200)
  } catch (error) {
    res.status(500).json({ message: 'Something went Wrong.', error: error.message })
  }
})

export { createAd, selectData, createCampaign, getCampaignList, getOverview, getTopAds, getDeviceTypeCounts, 
  getAdList, searchAdsByName, deleteAds, updateAdStatus, adGraphData, addFeedback, profile, updateProfilePicture, 
  updateUserDetails, accountSettings };
