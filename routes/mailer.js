var config = require('../config/mailer');
var nodemailer = require('nodemailer');

var transport = nodemailer.createTransport({
    service: 'gmail',
    secure: false,
    port: 25,
    auth: {
        user: config.EMAIL_USER,
        pass: config.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
})

module.exports = {
    sendEmail(from,to,subject,html){
        transport.sendMail({from,to,subject,html}, function(err,info){
            if (err){console.log(err)};
        });
    }
};
