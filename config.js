require("dotenv").config();

module.exports = {
  jwtSecret: {
    jwtSecret: process.env.JWT_SECRET,
    expiresIn: "10d",
  },
  // msg91: {
  //     authKey: process.env.MSG91_AUTH_KEY,
  //     baseUrl: "https://control.msg91.com/api/v5",
  //     templets: {
  //         otp: "6684e2cad6fc0540dc648dc2",//var 1 user var 2 otp
  //         welcome: ""
  //     },
  //     senderId: "test123",
  //     route: 4
  // },
  pagination: {
    app: {
      limit: 10,
      maxLimit: 200,
    },
    agency: {
      limit: 10,
      maxLimit: 200,
    },
    admin: {
      limit: 10,
      maxLimit: 200,
    },
    bd: {
      limit: 10,
      maxLimit: 200,
    },
    limit: 10,
    maxLimit: 200,
  },
  http: {
    port: 80,
  },
  refer: {
    amount: 25,
  },
  mongodb: {
    dbConnectionString: process.env.MONGODB_CONNECTION_STRING,
  },
  wordpress: {
    baseUrl: "https://image.devloperhemant.com",
    username: "admin",
    appPassword: process.env.WORDPRESS_APP_PASSWORD,
  },
  giftChnageToDiamond:1,
};
