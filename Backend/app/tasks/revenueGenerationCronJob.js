import cron from "node-cron";
import { sequelize } from "../../config/dbconnection.js";
import { Visit } from "../models/visitmodel.js";
import { Click } from "../models/clickmodel.js";
import { Revenue } from "../models/revenuemodel.js";
import { CPC_Rate } from "../models/cpcratemodel.js";
import { CPT_Rate } from "../models/cptratemodel.js";
import { Publisher } from "../models/publishermodel.js";
import { Website } from "../models/websitemodel.js";
import { Ad } from "../models/adtablemodel.js";
import { fn, Op } from "sequelize";

// Revenue Calculation Logic
async function calculateMonthlyRevenue() {
  try {
    const today = new Date();
    const lastMonth = today.getMonth() === 0 ? 12 : today.getMonth(); // Handle January
    const year = lastMonth === 12 ? today.getFullYear() - 1 : today.getFullYear();

    // Step 1: Fetch Click and Impression Data
    const clickData = await Click.findAll({
      attributes: [
        "publisher_id",
        "website_id",
        "ad_id",
        [sequelize.fn("SUM", sequelize.col("click_count")), "total_click"],
      ],
      where: {
        [Op.and]: [
          sequelize.where(fn("MONTH", sequelize.col("createdAt")), lastMonth),
          sequelize.where(fn("YEAR", sequelize.col("createdAt")), year),
        ],
      },
      include: [
        { model: Publisher, attributes: ["publisher_id"] },
        { model: Website, attributes: ["website_id"] },
        { model: Ad, attributes: ["ad_id"] },
      ],
      group: ["Click.publisher_id", "Click.website_id", "Click.ad_id"],
    });

    const impressionData = await Visit.findAll({
      attributes: [
        "publisher_id",
        "website_id",
        "ad_id",
        [sequelize.fn("SUM", sequelize.col("visit_count")), "total_impression"],
      ],
      where: {
        [Op.and]: [
          sequelize.where(fn("MONTH", sequelize.col("createdAt")), lastMonth),
          sequelize.where(fn("YEAR", sequelize.col("createdAt")), year),
        ],
      },
      include: [
        { model: Publisher, attributes: ["publisher_id"] },
        { model: Website, attributes: ["website_id"] },
        { model: Ad, attributes: ["ad_id"] },
      ],
      group: ["Visit.publisher_id", "Visit.website_id", "Visit.ad_id"],
    });

    // Step 2: Fetch CPC and CPT Rates
    const cpcRates = await CPC_Rate.findAll({
      order: [["click_range_min", "ASC"]],
    }); // Sorted by click ranges
    const cptRate = await CPT_Rate.findOne(); // Assuming one global CPT rate

    // Step 3: Merge Click and Impression Data
    const revenueData = {};
    clickData.forEach((click) => {
      const key = `${click.publisher_id}-${click.website_id}-${click.ad_id}`;
      revenueData[key] = {
        publisher_id: click.publisher_id,
        website_id: click.website_id,
        ad_id: click.ad_id,
        total_click: parseInt(click.total_click, 10),
        total_impression: 0, // To be updated
        click_revenue: 0,
        impression_revenue: 0,
        total_revenue: 0,
        month: lastMonth,
        year,
      };
    });

    impressionData.forEach((impression) => {
      const key = `${impression.publisher_id}-${impression.website_id}-${impression.ad_id}`;
      if (!revenueData[key]) {
        revenueData[key] = {
          publisher_id: impression.publisher_id,
          website_id: impression.website_id,
          ad_id: impression.ad_id,
          total_click: 0,
          total_impression: parseInt(impression.total_impression, 10),
          click_revenue: 0,
          impression_revenue: 0,
          total_revenue: 0,
          month: lastMonth,
          year,
        };
      } else {
        revenueData[key].total_impression = parseInt(
          impression.total_impression,
          10
        );
      }
    });

    // Step 4: Calculate Revenues
    for (const key in revenueData) {
      const data = revenueData[key];

      // Calculate Click Revenue
      let remainingClicks = data.total_click;
      for (const rate of cpcRates) {
        if (remainingClicks > 0) {
          const rangeClicks = Math.min(
            remainingClicks,
            rate.click_range_max - rate.click_range_min + 1
          );
          data.click_revenue += rangeClicks * rate.cpc_rate;
          remainingClicks -= rangeClicks;
        } else {
          break;
        }
      }

      // Calculate Impression Revenue
      data.impression_revenue =
        Math.floor(data.total_impression / 1000) * cptRate.cpt_rate;

      // Calculate Total Revenue
      data.total_revenue =
        data.click_revenue + data.impression_revenue;
    }

    // Step 5: Insert Revenue Data into Database
    await Revenue.bulkCreate(Object.values(revenueData), {
      updateOnDuplicate: [
        "total_click",
        "total_impression",
        "click_revenue",
        "impression_revenue",
        "total_revenue",
        "updatedAt",
      ],
    });

    console.log("Monthly revenue calculation completed successfully.");
  } catch (error) {
    console.error("Error calculating monthly revenue:", error);
  }
}

const revenueGenerationCronJob =()=>{

    // Schedule the task to run at midnight on the 1st of every month
    cron.schedule("0 0 1 * *", calculateMonthlyRevenue);
}

export default revenueGenerationCronJob;

//--------------------------------------------------------------------------------------------



// import cron from 'node-cron';
// import { sequelize } from '../../config/dbconnection.js';
// import { Visit } from '../models/visitmodel.js';
// import {  fn, Op } from "sequelize";
// import { Publisher } from '../models/publishermodel.js';
// import { Users } from '../models/usersmodel.js';
// import { Website } from '../models/websitemodel';
// import { Ad } from '../models/adtablemodel.js';
// import { Click } from '../models/clickmodel.js';

// // Revenue Calculation Logic
// async function calculateMonthlyRevenue() {
//   try {
//     const today = new Date();
//     const lastMonth = today.getMonth() === 0 ? 12 : today.getMonth(); // Handle January (month 0)
//     const year = lastMonth === 12 ? today.getFullYear() - 1 : today.getFullYear();

//     // Query Click and Impression tables for last month
    
//     const visitData = await Visit.findAll({
      
//       attributes: [
//         [sequelize.fn("SUM", sequelize.col("visit_count")), "total_impression"],
//       ],
//       where: {
//         [Op.and]: [
//           sequelize.where(sequelize.fn('MONTH', sequelize.col('createdAt')), lastMonth),
//           sequelize.where(sequelize.fn('YEAR', sequelize.col('createdAt')), year),
//         ],
//       },
      
//       include: [
//         {
//           model: Publisher,
//           attributes: ["publisher_id"],
//           include: [
//             {
//               model: Users,
//               attributes: ["name"], // Publisher's name from Users table
//             },
//           ],
//         },
//         {
//           model: Website,
//           attributes: ["website_id","website_name", "website_url"],
//         },
//         {
//           model: Ad,
//           attributes: [
//             "ad_id",
//             "ad_name",
//           ],
//         },
//       ],
//       group: [
//         "Visit.ad_id",
//         "Visit.publisher_id",
//         "Publisher.publisher_id",
//         "Publisher->User.user_id",
//         "Publisher->User.name",
//         "Website.website_id",
//         "Website.website_name",
//         "Website.website_url",
//         "Ad.ad_id",
//         "Ad.ad_name",
//       ],
//     });

//     const clickData = await Click.findAll({
      
//       attributes: [
//         [sequelize.fn("SUM", sequelize.col("click_count")), "total_click"],
//       ],
//       where: {
//         [Op.and]: [
//           sequelize.where(sequelize.fn('MONTH', sequelize.col('createdAt')), lastMonth),
//           sequelize.where(sequelize.fn('YEAR', sequelize.col('createdAt')), year),
//         ],
//       },
      
//       include: [
//         {
//           model: Publisher,
//           attributes: ["publisher_id"],
//           include: [
//             {
//               model: Users,
//               attributes: ["name"], // Publisher's name from Users table
//             },
//           ],
//         },
//         {
//           model: Website,
//           attributes: ["website_id","website_name", "website_url"],
//         },
//         {
//           model: Ad,
//           attributes: [
//             "ad_id",
//             "ad_name",
//           ],
//         },
//       ],
//       group: [
//         "Click.ad_id",
//         "Click.publisher_id",
//         "Publisher.publisher_id",
//         "Publisher->User.user_id",
//         "Publisher->User.name",
//         "Website.website_id",
//         "Website.website_name",
//         "Website.website_url",
//         "Ad.ad_id",
//         "Ad.ad_name",
//       ],
//     });
    
//   } catch (err) {
//     console.error('Error calculating monthly revenue:', err);
//   }
// }

// // Schedule the task to run at midnight on the 1st of every month
// cron.schedule('0 0 1 * *', calculateMonthlyRevenue);
