import cron from 'node-cron';
import { Op } from 'sequelize';
import { Ad } from '../models/adtablemodel.js';

// Function to run cron job
const adStatusCronJob = () => {
  // This will run every minute
  cron.schedule('* * * * *', async () => {
    try {
      const currentDate = new Date();

      // Update ads to 'active' if start_date has come and status is 'paused'
      await Ad.update(
        { status: 'active' },
        {
          where: {
            start_date: {
              [Op.lte]: currentDate,
            },
            permission:'approved',
            status_manually_changed: false,
          },
        }
      );

      // Update ads to 'inactive' if end_date has passed
      await Ad.update(
        { status: 'inactive' },
        {
          where: {
            end_date: {
              [Op.lte]: currentDate,
            },
            status: { [Op.ne]: 'inactive' },
            //status_manually_changed: false,
          },
        }
      );

      //console.log('Cron job ran and updated ad statuses');
    } catch (error) {
      console.error('Error updating ad status:', error.message);
    }
  });
};

// Export the cron job function to use in app.js
export default adStatusCronJob;
