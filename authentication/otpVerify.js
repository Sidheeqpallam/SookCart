const env = require('dotenv').config()



const config = {
  serviceID: process.env.SERVICE_ID,
  accountSID: process.env.ACCOUNT_SID,
  authToken: process.env.AUTH_TOKEN
};


// const client = require("twilio")(config.accountSID, config.authToken);

module.exports = {
  getOtp: (number) => {
    number = "+91" + number;

    return new Promise((resolve, reject) => {
      // client.verify.v2
      //   .services(config.serviceID)
      //   .verifications.create({ to: number, channel: "sms" })
      //   .then((response) => {
      //     console.log(response);
      //     resolve(response);
      //     console.log("promise done");
      //   });
      resolve(true)
    });
  },
  checkOtp: (otp, number) => {
    number = "+91" + number;

    return new Promise((resolve, reject) => {
      // client.verify.v2.services(config.serviceID).verificationChecks.create({ to: number, code: otp }).then((verification_check) => {
      //   console.log(verification_check.status);
      //   resolve(verification_check.status);
      // });
      resolve(true)
    });
  },
};
