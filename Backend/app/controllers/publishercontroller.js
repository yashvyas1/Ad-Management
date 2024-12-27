import asyncHandler from "express-async-handler";
import { Publisher } from "../models/publishermodel.js";
import { Visit } from "../models/visitmodel.js";
import { Click } from "../models/clickmodel.js";
import { Visitor } from "../models/visitormodel.js";
import { sequelize } from "../../config/dbconnection.js";
import { col, fn, Op, where } from "sequelize";
import { verifyDomain, weekCustomSort } from "../../utils/customUtils.js";
import { Website } from "../models/websitemodel.js";
import { PublisherFeedback } from "../models/publisherfeedbackmodel.js";
import moment from "moment";
import { Users } from "../models/usersmodel.js";

const generateScript = asyncHandler(async(req, res) => {
  try{
    const website_id = req.query.website_id
    const user_id = req?.publisher?.user_id
    if (!user_id) {
      return res.status(401).json({message: 'Unauthorized User'})
    }
    const publisher_id = await Publisher.findOne({
        where: {user_id},
        attributes: ['publisher_id']
    })
    const slots = await Website.findOne({
        where: {website_id},
        attributes: ['available_position']
    })
    const available_position = slots.dataValues.available_position
    const scriptBase = `// To be added in Header \n<script async src="${process.env.base_url}/admin/ad-script.js?publisherID=${publisher_id.dataValues.publisher_id}&websiteID=${website_id}"></script>`
    const positions = {
        'right-sidebar': 'right-sidebar',
        'left-sidebar': 'left-sidebar',
        'top-bar': 'top-bar',
        'bottom-bar': 'bottom-bar'
    };
    let script = scriptBase;
    Object.keys(positions).forEach(position => {
        if (available_position.includes(position)) {
            script += `\n\n //For Ad location: ${positions[position]} \n<ins class="${positions[position]}" style="display:block;width:160px;height:400px;"></ins>`;
        }
    });
    res.setHeader('Content-Type', 'text/plain')
    res.status(200).send(script)
  }catch (error) {
    res.status(500).json({message: 'Something went Wrong.', error:error.message})
}
})

const getOverview = asyncHandler(async (req, res) => {
  const user_id = req?.publisher?.user_id;
  if (!user_id) {
    return res.status(401).json({message: 'Unauthorized User'})
  }
  const publisher = await Publisher.findOne({
    where: { user_id },
    attributes: ["publisher_id"],
  });
  const publisher_id = publisher.dataValues.publisher_id;
  try {
    const adCount = await Visit.count({
      where: { publisher_id },
      distinct: true,
      col: "ad_id",
    });
    const totalClicks = await Click.count({
      where: { publisher_id },
    });
    const totalVisits = await Visit.count({
      where: { publisher_id },
    });
    const ctr = totalVisits == 0 ? 0 : (totalClicks / totalVisits) * 100;
    const roundedCtr = ctr.toFixed(2);
    res.status(200).json({ adCount, totalVisits, ctr: roundedCtr, cpc: 0 });
  } catch (error) {
    res.status(500).json({message: 'Something went Wrong.', error:error.message})
}
});

const getDeviceTypes = asyncHandler(async (req, res) => {
  const user_id = req?.publisher?.user_id;
  if (!user_id) {
    return res.status(401).json({message: 'Unauthorized User'})
  }
  const publisher = await Publisher.findOne({
    where: { user_id },
    attributes: ["publisher_id"],
  });
  const publisher_id = publisher.dataValues.publisher_id;
  try {
    const response = await Visitor.findAll({
      where: { publisher_id },
      attributes: [
        "device_type",
        [sequelize.fn("COUNT", sequelize.col("visitor_id")), "device_count"],
      ],
      group: ["device_type"],
      order: [["device_count", "DESC"]],
    });
    const deviceTypeCounts = response.map((item) => item.dataValues);
    res.status(200).json({ deviceTypeCounts });
  } catch (error) {
    res.status(500).json({message: 'Something went Wrong.', error:error.message})
}
});

const adGraphData = asyncHandler(async (req, res) => {
  const user_id = req?.publisher?.user_id;
  if (!user_id) {
    return res.status(401).json({message: 'Unauthorized User'})
  }
  const publisher = await Publisher.findOne({
    where: { user_id },
    attributes: ["publisher_id"],
  });
  const publisher_id = publisher.dataValues.publisher_id;
  const { filter } = req.query;
  if (!publisher_id && !filter) {
    return res
      .status(400)
      .json({ message: "Filter and Publisher Id is needed." });
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
          publisher_id,
          createdAt: { [Op.gte]: lastWeek },
        },
        attributes: [
          [sequelize.literal('EXTRACT(DOW FROM "createdAt")'), "groupKey"], // Group by day of the week
          [fn("SUM", col("click_count")), "totalClicks"],
        ],
        group: ["groupKey"],
      });
      visitsData = await Visit.findAll({
        where: {
          publisher_id,
          createdAt: { [Op.gte]: lastWeek },
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
          publisher_id,
          createdAt: { [Op.gte]: lastYear },
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
          publisher_id,
          createdAt: { [Op.gte]: lastYear },
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
          publisher_id,
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
          publisher_id,
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
      return res.status(400).json({
        error: 'Invalid filter parameter. Use "week", "month", or "year".',
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
    res.status(500).json({message: 'Something went Wrong.', error:error.message})
}
});

const websiteGraphData = asyncHandler(async (req, res) => {
  const user_id = req?.publisher?.user_id;
  if (!user_id) {
    return res.status(401).json({message: 'Unauthorized User'})
  }
  const publisher = await Publisher.findOne({
    where: { user_id },
    attributes: ["publisher_id"],
  });
  const publisher_id = publisher.dataValues.publisher_id;
  const { filter } = req.query;
  let visitorData;
  try {
    const now = new Date();
    const todayValue = new Date().getDay();
    if (filter == "week") {
      const lastWeek = new Date(now);
      lastWeek.setDate(now.getDate() - 6);
      const currentDayOfWeek = now.getDay();
      visitorData = await Visitor.findAll({
        where: {
          publisher_id,
          createdAt: { [Op.gte]: lastWeek },
        },
        attributes: [
          [sequelize.literal('EXTRACT(DOW FROM "createdAt")'), "groupKey"], // Group by day of the week
          [fn("COUNT", col("visitor_id")), "totalVisits"],
        ],
        group: ["groupKey"],
      });
      visitorData = visitorData.sort((a, b) => {
        const dayA = parseInt(a.dataValues.groupKey);
        const dayB = parseInt(b.dataValues.groupKey);
        return (
          ((dayA - currentDayOfWeek + 7) % 7) -
          ((dayB - currentDayOfWeek + 7) % 7)
        );
      });
    } else if (filter == "month") {
      const lastYear = new Date(now);
      lastYear.setFullYear(now.getFullYear() - 1);
      visitorData = await Visitor.findAll({
        where: {
          publisher_id,
          createdAt: { [Op.gte]: lastYear },
        },
        attributes: [
          [sequelize.literal(`TO_CHAR("createdAt", 'Month')`), "groupKey"], // Group by month
          [sequelize.literal(`EXTRACT(MONTH FROM "createdAt")`), "monthOrder"], // Add numeric month for sorting
          [fn("COUNT", col("visitor_id")), "totalVisits"],
        ],
        group: ["groupKey", "monthOrder"],
        order: [[sequelize.literal('"monthOrder"'), "ASC"]], // Wrap "monthOrder" in quotes
      });
    } else if (filter == "year") {
      // Last 10 years
      const lastDecade = new Date(now);
      lastDecade.setFullYear(now.getFullYear() - 10);
      visitorData = await Visitor.findAll({
        where: {
          publisher_id,
          createdAt: { [Op.gte]: lastDecade },
        },
        attributes: [
          [sequelize.literal('EXTRACT(YEAR FROM "createdAt")'), "groupKey"],
          [fn("COUNT", col("visitor_id")), "totalVisits"],
        ],
        group: ["groupKey"],
        order: [[sequelize.literal('"groupKey"'), "ASC"]],
      });
    }
    const dataMap = new Map();
    for (let visit of visitorData) {
      const groupKey = visit.dataValues.groupKey.trim();
      if (dataMap.has(groupKey)) {
        dataMap.get(groupKey).totalVisits = visit.dataValues.totalVisits;
      } else {
        dataMap.set(groupKey, {
          groupKey: groupKey,
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
    res.status(500).json({message: 'Something went Wrong.', error:error.message})
}
});

const adRevenue = asyncHandler(async (req, res) => {
  try {
    const user_id = req?.publisher?.user_id;
    if (!user_id) {
      return res.status(401).json({message: 'Unauthorized User'})
    }
    const publisherData = await Publisher.findOne({
      where: { user_id },
      attributes: [
        "website_name",
        "website_url",
        [
          sequelize.fn("COUNT", sequelize.col("Clicks.click_id")),
          "total_clicks",
        ], // Count total clicks
      ],
      include: [
        {
          model: Click,
          attributes: [],
        },
      ],
      group: ["Publisher.publisher_id"],
      raw: true,
      subQuery: false,
    });

    if (!publisherData) {
      return res.status(404).json({ message: "Publisher not found" });
    }

    res.status(200).json({ publisherData });
  } catch (error) {
    res.status(500).json({message: 'Something went Wrong.', error:error.message})
}
});

const deleteWebsite = asyncHandler(async (req, res) => {
  try {
    const { website_ids } = req.body;
    const user_id = req?.publisher?.user_id;
    if (!user_id) {
      return res.status(401).json({message: 'Unauthorized User'})
    }
    const publisher = await Publisher.findOne({
      where: { user_id },
      attributes: ["publisher_id"],
    });
    const publisher_id = publisher.dataValues.publisher_id;

    if (!website_ids || website_ids.length === 0) {
      return res.status(400).json({ message: "No website Ids provided" });
    }

    const deletedCount = await Website.destroy({
      where: {
        publisher_id: publisher_id,
        website_id: website_ids,
      },
    });
    if (deletedCount === 0) {
      return res.status(404).json({ message: "No Website found to delete" });
    }

    res
      .status(200)
      .json({ message: `${deletedCount} Websites deleted Successfully.` });
  } catch (error) {
    res.status(500).json({message: 'Something went Wrong.', error:error.message})
}
});

const adRevenueExport = asyncHandler(async (req, res) => {
  try {
    const user_id = req?.publisher?.user_id;
    if (!user_id) {
      return res.status(401).json({message: 'Unauthorized User'})
    }
    const { websiteCategory } = req.body;
    const whereClause = { user_id };

    // If websiteCategory is provided, modify the where clause to filter by category
    if (
      websiteCategory &&
      Array.isArray(websiteCategory) &&
      websiteCategory.length > 0
    ) {
      whereClause.website_category = websiteCategory; // Use the array directly
    }
    const data = await Publisher.findAll({
      where: whereClause,
      attributes: [
        "publisher_id",
        "website_name",
        "website_url",
        [
          sequelize.fn("COUNT", sequelize.col("Clicks.click_id")),
          "total_clicks",
        ], // Count the clicks
      ],
      include: [
        {
          model: Click, // Assuming Click is your model for the Click table
          attributes: [], // Don't select any specific attributes from the Click table
        },
      ],
      group: ["Publisher.publisher_id"], // Group by publisher to aggregate clicks
      raw: true,
      subQuery: false,
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({message: 'Something went Wrong.', error:error.message})
}
});

const websiteList = asyncHandler(async (req, res) => {
  try {
    const user_id = req?.publisher?.user_id;
    if (!user_id) {
      return res.status(401).json({message: 'Unauthorized User'})
    }
    const { status, updateDate } = req.query;
    const publisher = await Publisher.findOne({
      where: { user_id },
      attributes: ["publisher_id"],
    });
    const publisher_id = publisher.dataValues.publisher_id;
    let whereClause = { publisher_id };
    if (status) {
      whereClause.status = status; // Add status to where clause
    }
    if (updateDate) {
      const startOfDay = moment(updateDate, "YYYY/MM/DD").startOf("day").utcOffset(0, true).toDate();
      const endOfDay = moment(updateDate, "YYYY/MM/DD").endOf("day").utcOffset(0, true).toDate();
      
      whereClause.updatedAt = {
        [Op.between]: [startOfDay, endOfDay], // Match updatedAt within the given day
      };
    }

    const websiteData = await Website.findAll({
      where: whereClause,
      attributes: [
        "Website.*",
        [
          sequelize.fn("COUNT", sequelize.col("Clicks.click_count")),
          "total_clicks",
        ], // Count total clicks
      ],
      include: [
        {
          model: Click,
          attributes: [],
        },
      ],
      group: ["Website.website_id"],
      order: [['createdAt', 'DESC']],
      raw: true,
      subQuery: false,
    });
    res.status(200).json({ websiteListData: websiteData });
  } catch (error) {
    res.status(500).json({message: 'Something went Wrong.', error:error.message})
}
});

const updateWebsiteStatus = asyncHandler(async (req, res) => {
  try {
    const { website_ids, action } = req.body;
    const user_id = req?.publisher?.user_id;
    if (!user_id) {
      return res.status(401).json({message: 'Unauthorized User'})
    }
    if (!website_ids || !action) {
      return res.json({message : "All fields are Required"})
    }
    const publisher = await Publisher.findOne({
      where: { user_id },
      attributes: ["publisher_id"],
    });
    const publisher_id = publisher.dataValues.publisher_id;

    // Validate input
    if (
      !website_ids ||
      !Array.isArray(website_ids) ||
      website_ids.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "Website IDs are Required and should be an Array." });
    }
    if (!action || !["pause", "resume", "stop"].includes(action)) {
      return res.status(400).json({
        message:
          'Invalid action. Action should be "pause", "resume", or "stop".',
      });
    }

    if (action === "pause") {
      // Update active websites to paused
      const updatedWebsites = await Website.update(
        { status: "paused" }, // Set status to 'paused'
        {
          where: {
            publisher_id: publisher_id,
            website_id: {
              [Op.in]: website_ids,
            },
            status: {
              [Op.ne]: "inactive", // Ignore 'inactive' websites
            },
          },
        }
      );

      return res.status(200).json({
        message: `Successfully paused ${updatedWebsites[0]} website(s).`,
      });
    }

    if (action === "resume") {
      // Update paused websites to active
      const updatedWebsites = await Website.update(
        { status: "active" }, // Set status to 'active'
        {
          where: {
            publisher_id: publisher_id,
            website_id: {
              [Op.in]: website_ids,
            },
            status: {
              [Op.ne]: "inactive", // Ignore 'inactive' websites
            },
          },
        }
      );

      return res.status(200).json({
        message: `Successfully Resumed ${updatedWebsites[0]} website(s).`,
      });
    }

    if (action === "stop") {
      // Update active or paused websites to inactive
      const updatedWebsites = await Website.update(
        { status: "inactive" }, // Set status to 'inactive'
        {
          where: {
            publisher_id: publisher_id,
            website_id: {
              [Op.in]: website_ids,
            },
            status: {
              [Op.or]: ["paused", "active"], // Only update 'paused' or 'active' websites
            },
          },
        }
      );
      return res.status(200).json({
        message: `Successfully Stopped ${updatedWebsites[0]} website(s).`,
      });
    }
  } catch (error) {
    res.status(500).json({message: 'Something went Wrong.', error:error.message})
}
});

const searchWebsiteByName = asyncHandler(async (req, res) => {
  try {
    const { website_name } = req.query;
    const user_id = req?.publisher?.user_id;
    if (!user_id) {
      return res.status(401).json({message: 'Unauthorized User'})
    }
    const publisher = await Publisher.findOne({
      where: { user_id },
      attributes: ["publisher_id"],
    });
    const publisher_id = publisher.dataValues.publisher_id;

    // Validate the query parameter
    if (!website_name) {
      return res
        .status(200)
        .json({ message: "Website name is Required for search." });
    }

    // Build the where clause for searching website name
    const whereClause = {
      publisher_id: publisher_id,
      website_name: {
        [Op.iLike]: `${website_name}%`, // Case-insensitive search
      },
    };

    // Fetch websites based on the name search
    const websiteData = await Website.findAll({
      where: whereClause,
      attributes: [
        "Website.*",
        [
          sequelize.fn("COUNT", sequelize.col("Clicks.click_count")),
          "total_clicks",
        ], // Count total clicks
      ],
      include: [
        {
          model: Click,
          attributes: [],
        },
      ],
      group: ["Website.website_id"],
      raw: true,
      subQuery: false,
    });

    if (websiteData.length === 0) {
      return res
        .status(200)
        .json({ message: "No websites found with the given name." });
    }

    return res.status(200).json({
      message: `Websites found for search term "${website_name}".`,
      websiteData,
    });
  } catch (error) {
    res.status(500).json({message: 'Something went Wrong.', error:error.message})
}
});

const websiteListExport = asyncHandler(async (req, res) => {
  try {
    const user_id = req?.publisher?.user_id;
    if(!user_id){
      return res.status(401).json({message: 'Unauthorized User'})
    }
    const { websiteCategory } = req.body;
    const publisher = await Publisher.findOne({
      where: { user_id },
      attributes: ["publisher_id"],
    });
    const publisher_id = publisher.dataValues.publisher_id;
    const whereClause = { publisher_id };

    // If websiteCategory is provided, modify the where clause to filter by category
    if (
      websiteCategory &&
      Array.isArray(websiteCategory) &&
      websiteCategory.length > 0
    ) {
      whereClause.website_category = websiteCategory; // Use the array directly
    }
    const data = await Publisher.findAll({
      where: whereClause,
      attributes: [
        "publisher_id",
        "website_name",
        "website_category",
        "website_url",
      ],
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({message: 'Something went Wrong.', error:error.message})
}
});

const addWebsite = asyncHandler(async (req, res) => {
  try {
    const user_id = req?.publisher?.user_id;
    if (!user_id) {
      return res.status(401).json({message: 'Unauthorized User'})
    }
  const { website, websitename, allowcategory, disallowcategory } = req.body;
  if (
    !website ||
    !websitename ||
    (allowcategory === undefined) ||
    (disallowcategory === undefined)
  ) {
    return res.status(400).send("All Fields are Required");
  }
  // Check if the website URL already exists
  const existingWebsite = await Website.findOne({
    where: { website_url: website },
  });

  if (existingWebsite) {
    return res.status(400).json({ message: "Website URL already exists!" });
  }
  const isWebsiteVerified = await verifyDomain(website);
  let isVerified = false;
  let status = "inactive";
  if (isWebsiteVerified) {
    isVerified = true;
    status = "active";
  }
  const publisher = await Publisher.findOne({
    where: { user_id },
    attributes: ["publisher_id"],
  });
  const publisher_id = publisher.dataValues.publisher_id;

    let allowedCategories = allowcategory.length === 0 ? [] : allowcategory;
    let disallowedCategories = disallowcategory.length === 0 ? [] : disallowcategory;
    const websiteCreated = await Website.create(
        {
          publisher_id: publisher_id,
          website_name: websitename,
          website_url: website,
          is_verified: isVerified,
          status: status,
          allow_category: allowedCategories,
          disallow_category: disallowedCategories,
        },
      );
      if (websiteCreated) {
        res.status(201).json({message : "Website Added Successfully!"})
      }
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      // Handle unique constraint error
      res.status(400).json({ message: 'Website URL already exists!' });
    } else {
      res.status(500).json({ message: 'Something went Wrong.', error: error.message });
    }
}
});

const addFeedback = asyncHandler( async(req, res) => {
  const user_id = req?.publisher?.user_id;
  const feedbackText = req.body.feedback
  if (!user_id) {
    return res.status(401).json({ message: 'Unauthorized User' })
  }
  if (!feedbackText) {
    return res.status(401).json({ message: 'Feedback cannot be Empty' })
  }
  try {
    const publisher = await Users.findOne({
      where: { user_id },
      attributes: ['name', 'email']
    })
    const publisher_name = publisher.dataValues.name;
    const email = publisher.dataValues.email
    await PublisherFeedback.create({
      publisher_name: publisher_name,
      email: email,
      feedback_text: feedbackText
    })
    res.status(200).json({message: 'Feedback sent successfully'})
  } catch (error) {
    res.status(500).json({ message: 'Something went Wrong.', error: error.message })
  }
})

const accountSettings = asyncHandler(async(req, res) => {
  const user_id = req?.publisher?.user_id;
  if (!user_id) {
    return res.status(401).json({ message: 'Unauthorized User' })
  }
  try{
    const userDetails = await Users.findOne({ where: {user_id}})
    const country = userDetails.country
    const bankDetails = await Publisher.findOne({
      where: { user_id },
      attributes: ['bank_name', 'branch_name', 'account_number', 'account_holder_name', 'IFSC_code']
    });
    const {bank_name, branch_name, account_number, account_holder_name, IFSC_code} = bankDetails
    res.json({country, bank_name, branch_name, account_number, account_holder_name, IFSC_code})
  } catch (error) {
    res.status(500).json({ message: 'Something went Wrong.', error: error.message })
  }
})

const updatePayment = asyncHandler(async(req, res) => {
  const user_id = req?.publisher?.user_id;
  if (!user_id) {
    return res.status(401).json({ message: 'Unauthorized User' })
  }
  const {bankName, branchName, accountHolderName, ifscCode, accountno} = req.body
  if(!bankName || !branchName || !accountHolderName || !ifscCode || !accountno) {
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    await Publisher.update(
      {bankName, branchName, accountHolderName, ifscCode, accountno},
      {where: {user_id}}
    )
    res.status(200).json({message: 'Details Updated Successfully'})
  } catch (error) {
    res.status(500).json({ message: 'Something went Wrong.', error: error.message })
  }
})

const profileSettings = asyncHandler(async(req, res) => {
  const user_id = req?.publisher?.user_id;
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

const updateProfilePicture = asyncHandler(async(req, res) => {
  const user_id = req?.publisher?.user_id;
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
  const user_id = req?.publisher?.user_id;
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

export {
  generateScript,
  getOverview,
  getDeviceTypes,
  adGraphData,
  websiteGraphData,
  adRevenue,
  deleteWebsite,
  adRevenueExport,
  updateWebsiteStatus,
  websiteList,
  websiteListExport,
  searchWebsiteByName,
  addWebsite,
  addFeedback,
  accountSettings,
  updatePayment,
  profileSettings,
  updateProfilePicture,
  updateUserDetails
};
