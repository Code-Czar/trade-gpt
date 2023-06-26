// const nodemailer = require('nodemailer');
import sgMail from '@sendgrid/mail';

import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendSignalEmail(signal, symbol, timeframe) {
    const msg = {
        to: 'contact@benjamintourrette.com', // Change to your recipient
        from: 'contact@benjamintourrette.com', // Change to your sender
        subject: `Trading signal for ${symbol} on ${timeframe}`,
        text: `A ${signal} signal was generated for ${symbol} on ${timeframe}.`,
        html: `<p>A <strong>${signal}</strong> signal was generated for <strong>${symbol}</strong> on <strong>${timeframe}</strong>.</p>`,
    };

    try {
        await sgMail.send(msg);
        console.log(`Email sent to ${msg.to}`);
    } catch (error) {
        console.error(`Failed to send email:`, error);
    }
}
