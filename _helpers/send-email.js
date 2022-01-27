const nodemailer = require('nodemailer');
const config = require('config.json');

module.exports = sendEmail;

async function sendEmail({ to, subject, html, from = config.emailFrom }) {
    const transporter = nodemailer.createTransport(config.smtpOptions);
    await transporter.sendMail({ from, to, subject, html });
}

// "emailFrom": "coleman.champlin10@ethereal.email",
// "smtpOptions": {
//     "host": "smtp.ethereal.email",
//     "port": 587,
//     "secure" : false,
//     "auth": {
//         "user": "coleman.champlin10@ethereal.email",
//         "pass": "Bz5MemUn3djjNaagHF"
//     }
// }