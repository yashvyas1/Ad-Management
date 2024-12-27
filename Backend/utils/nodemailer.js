import nodemailer from 'nodemailer'
import dotenv from "dotenv";
import moment from 'moment';
dotenv.config();


const getTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASS
        }
    });
};

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000);
};

const verifyEmailMail = async (email) => {
    const transporter = getTransporter();
    const otp = generateOTP()
    let mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'OTP Verfication for Ad Management',
        text: `Verfiy your email with this OTP: ${otp}`
    }

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending mail:', error);
                reject(error);
            } else {
                resolve(otp);
            }
        })
    })
}

const twoFactAuthMail = async (email) => {
    const transporter = getTransporter();
    const otp = generateOTP()
    let mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'OTP for 2-Factor Authentication.',
        text: `Your OTP for Authentication: ${otp}`
    }

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending mail:', error);
                reject(error);
            } else {
                resolve(otp);
            }
        })
    })
}

const feedbackResponseMail = async(feedback, response_text) => {
    const transporter = getTransporter();
    const formattedDateTime = moment(feedback.createdAt).format('DD/MM/YYYY HH:mm:ss');
    const mailOptions = {
        from: process.env.EMAIL,
        to: feedback.email,
        subject: `Response for the feedback dated at: ${formattedDateTime}`,
        text: response_text
    }
    
    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending mail:', error);
                reject(error);
            } else {
                resolve('Response Sent Successfuly');
            }
        })
    })
}

export { 
    verifyEmailMail,
    feedbackResponseMail,
    twoFactAuthMail
 }