import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import InitializeDatabase from './config/initializedatabase.js';
import adStatusCronJob from './app/tasks/adStatusCronJob.js';
import revenueGenerationCronJob from './app/tasks/revenueGenerationCronJob.js';
dotenv.config();

const app = express();
const port = process.env.port;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors());

// Start the cron job
adStatusCronJob();
revenueGenerationCronJob();

// Initialize database and create tables and then start the server
InitializeDatabase().then(async() => {
    const authRouter =(await import('./app/routes/authRoutes.js')).default;
    app.use('/auth', authRouter);
    const advertiserRouter =(await import('./app/routes/advertiserRoutes.js')).default;
    app.use('/advertiser', advertiserRouter);
    const adminRouter = (await import('./app/routes/adminRoutes.js')).default;
    app.use('/admin', adminRouter)
    const publisherRouter = (await import('./app/routes/publisherRoutes.js')).default;
    app.use('/publisher', publisherRouter)
    app.listen(port, () => {
        console.log(`Server is running.`);
    });
});