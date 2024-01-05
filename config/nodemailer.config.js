require("dotenv").config();
const nodemailer = require("nodemailer");
const config = require("../config/auth.config");

const user = config.user;
const pass = config.pass;

const transport = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: user,
    pass: pass,
  },
});

module.exports.sendConfirmationEmail = (lastname, email, verify_token) => {
  transport.sendMail({
    from: user,
    to: email,
    subject: "Please confirm your account",
    html: `<h1>Email Confirmation</h1>
        <h2>Hello ${lastname}</h2>
        <p>Thank you for subscribing. Please confirm your email by clicking on the following link</p>
        <a href=${config.reactURL}/auth/confirm/${verify_token}> Click here</a>
        </div>`,
  }).catch(err => console.log(err));
};

module.exports.sendForgotPasswordEmail = (lastname, email, reset_token) => {
  transport.sendMail({
    from: user,
    to: email,
    subject: "Password Reset link",
    html: `<h1>Hello ${lastname}, Please use the following link to reset your password</h1>
           <a href=${config.reactURL}/auth/reset/${reset_token}>Click here To Reset You Account. </a>
           <hr />
           <p>This email may contain sensetive information</p>
           <p>${config.reactURL}</p>`,
  }).catch(err => console.log(err));
};

module.exports.sendgoogleEmail = (lastname, email, password) => {
  transport.sendMail({
    from: user,
    to: email,
    subject: "Google Auth Backup Password",
    html: `<h1>Hello ${lastname}, Please use the following password : ${password} to login to your account in case.</h1>
           <hr />
           <p>This email may contain sensetive information</p>
           <p>${config.reactURL}</p>`,
  }).catch(err => console.log(err));
};
