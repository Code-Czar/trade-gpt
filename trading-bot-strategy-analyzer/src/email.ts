import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();
const sendSignal = false;
const tradingViewUrl = "https://www.tradingview.com/chart/?symbol=";


export async function sendSignalEmail(positionType: string, symbol: string, timeFrame: string, analysisType: string, exchange: string = "BINANCE") {
    if (!sendSignal) return;
    const credentials = {
        user: process.env.GMAIL_USER, // your Gmail account 
        pass: process.env.GMAIL_PASS // your Gmail App Password
    }
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: credentials
    });
    // console.log("🚀 ~ file: email.ts:14 ~ sendSignalEmail ~ auth:", credentials)
    const formattedSymbol = symbol.replace("/", "").replace("-", "");


    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: `"Benjamin Tourrette" <${process.env.GMAIL_USER}>`, // sender address
        to: process.env.GMAIL_USER, // list of receivers
        subject: `Trading signal for ${timeFrame} on ${analysisType}`, // Subject line
        text: `A ${symbol} | ${positionType}signal was generated for ${timeFrame} on ${analysisType}.`, // plain text body
        html: `<p>A <strong>${symbol} | ${positionType} </strong> signal was generated for <strong>${timeFrame}</strong> on <strong>${analysisType}</strong>.</p><br/> <a href="${tradingViewUrl}${exchange}:${formattedSymbol}"> View on trading view </a>`, // html body
    });

    // console.log('Message sent: %s', info.messageId);
}
