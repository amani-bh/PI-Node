const authConfig = require("../config/auth.config");
const User = require("../models/User.model");
const Roles = ["SUPER_ADMIN", "ADMIN", "CLIENT", "SUBSCRIBER", "DELIVERY_MAN"];
const RefreshToken = require("../models/RefreshToken.model");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const Location = require("../models/Location.model");
const nodemailer = require("../config/nodemailer.config");
const jwtConfig = require("../config/auth.config.js");
const EC = require("elliptic").ec;
const ec = new EC("secp256k1");
const key = ec.genKeyPair();

exports.signup = (req, res) => {
  
  const user = new User({
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    picture: req.body.picture,
    email: req.body.email,
    phone_number: req.body.phone_number,
    address: req.body.address,
    location: { larg: req.body.larg, long: req.body.long },
    solde: req.body.solde,
    password: bcrypt.hashSync(req.body.password, req.body.password.length),
  });

  user.save((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    if (req.body.role) {
      // console.log(req.body.role.toUpperCase());
      if (!Roles.includes(req.body.role.toUpperCase())) {
        res.status(400).send({
          message: `Failed! Role ${req.body.role} does not exist!`,
        });
        return;
      } else {
        //  console.log(req.body.role.toUpperCase());
        user.role = req.body.role.toUpperCase();
        user.save((err) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }

          res.send({ message: "User was registered successfully!" });
        });
      }
    } else {
      user.role = "CLIENT";
      user.save((err) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        res.send({ message: "User was registered successfully!" });
      });
    }
  });
};

exports.signin = (req, res) => {
  User.findOne({
    email: req.body.email,
  })
    .populate("role", "-__v")
    .exec(async (err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!",
        });
      }

      if (user.status == "NOT_VERFIED") {
        return res.status(401).send({
          message: "Pending Account. Please Verify Your Email!",
        });
      }

      let token = jwt.sign({ id: user.id }, authConfig.secret, {
        expiresIn: authConfig.jwtExpiration, // 86400 (24) hours = 60 * 60 * 24
      });

      let refreshToken = await RefreshToken.createToken(user);

      //console.log(refreshToken);

      var authority = [];
      authority.push("ROLE_" + user.role.toUpperCase());

      res.status(200).send({
        id: user._id,
        username: user.username,
        email: user.email,
        role: authority,
        accessToken: token,
        refreshToken: refreshToken,
        publicKey:user.publicKey,
        privateKey:user.privateKey
      });
    });
};

exports.signinFace = (req, res) => {
    //console.log(req.body.email);
    User.findOne({
        email: req.body.email,
    })
        .populate("role", "-__v")
        .exec(async (err, user) => {
            if (err) {
                res.status(500).send({ message: err });
                return;
            }

            if (!user) {
                return res.status(404).send({ message: "User Not found." });
            }


            if (user.status == "NOT_VERFIED") {
                return res.status(401).send({
                    message: "Pending Account. Please Verify Your Email!",
                });
            }

            let token = jwt.sign({ id: user.id }, authConfig.secret, {
                expiresIn: authConfig.jwtExpiration, // 86400 (24) hours = 60 * 60 * 24
            });

            let refreshToken = await RefreshToken.createToken(user);

            //console.log(refreshToken);

            var authority = [];
            authority.push("ROLE_" + user.role.toUpperCase());

            res.status(200).send({
                id: user._id,
                username: user.username,
                email: user.email,
                role: authority,
                accessToken: token,
                refreshToken: refreshToken,
                publicKey:user.publicKey,
                privateKey:user.privateKey
            });
        });
};

exports.refreshToken = async (req, res) => {
  const { refreshToken: requestToken } = req.body;

  if (requestToken == null) {
    return res.status(403).json({ message: "Refresh Token is required!" });
  }

  try {
    let refreshToken = await RefreshToken.findOne({ token: requestToken });

    if (!refreshToken) {
      res.status(403).json({ message: "Refresh token is not in database!" });
      return;
    }

    if (RefreshToken.verifyExpiration(refreshToken)) {
      RefreshToken.findByIdAndRemove(refreshToken._id, {
        useFindAndModify: false,
      }).exec();

      res.status(403).json({
        message: "Refresh token was expired. Please make a new signin request",
      });
      return;
    }

    let newAccessToken = jwt.sign(
      { id: refreshToken.user._id },
      authConfig.secret,
      {
        expiresIn: authConfig.jwtExpiration,
      }
    );

    return res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: refreshToken.token,
    });
  } catch (err) {
    return res.status(500).send({ message: err });
  }
};

exports.verifyUser = (req, res, next) => {
  User.findOne({
    verify_token: req.params.verify_token,
  })
      .then((user) => {
        //console.log(user);
        if (!user) {
          return res.status(404).send({ message: "User Not found." });
        }
        user.status = "VERIFIED";
        user.save((err) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }
        });
      })
      .catch((e) => console.log("error", e));
};

exports.forgotPassword = (req, res) => {
  const { email } = req.body;
 // console.log(email);
  User.findOne({ email }, (err, user) => {
    if (err || !user) {
      return res.status(400).json({
          message: 'User with this email does not exist'
      });
    }

      const reset_token = jwt.sign({ _id: user._id, lastname: user.lastname  }, authConfig.secret, {
          expiresIn: authConfig.jwtResetExpiration, // 86400 (24) hours = 60 * 60 * 24
      });

    return user.updateOne({ reset_token: reset_token }, (err, success) => {
      if (err) {
        //console.log('RESET PASSWORD LINK ERROR', err);
        return res.status(400).json({
            message: 'Database connection error on user password forgot request'
        });
      } else {

          nodemailer.sendForgotPasswordEmail(
              user.lastname,
              user.email,
              reset_token
          );

          return res.status(200).json({
              message: `Email has been sent to ${email}. Follow the instruction to Reset your account`
          });

      }
    });
  });
};

exports.resetPassword = (req, res) => {
    const { reset_token, newPassword } = req.body;
    //console.log(reset_token, newPassword );
    if (reset_token) {
        jwt.verify(reset_token, jwtConfig.secret, function(err, decoded) {
            if (err) {
                //console.log(err );
                return res.status(400).json({
                    message: 'Expired link. Try again'
                });
            }

            User.findOne({ reset_token }, (err, user) => {
                if (err || !user) {
                    return res.status(400).json({
                        message: 'Something went wrong. Try later'
                    });
                }

                // token.expiryDate.getTime() < new Date().getTime()

                const passwordHashed=bcrypt.hashSync(newPassword, newPassword.length );
                user.password=passwordHashed;
                user.reset_token = "";

                user.save((err, result) => {
                    if (err) {
                        return res.status(400).json({
                            message: 'Error resetting user password'
                        });
                    }
                    res.json({
                        message: `Great! Now you can login with your new password`
                    });
                });
            });
        });
    }
};

const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
exports.googleLogin = (req, res) => {
    const { idToken } = req.body;
    //console.log(idToken);

    client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID }).then(response => {
       // console.log('GOOGLE LOGIN RESPONSE',response);
       // console.log('GOOGLE LOGIN RESPONSE PAYLOAD',response.payload);
        const { email_verified, name, email,family_name,given_name,picture } = response.payload;

        if (email_verified) {
            User.findOne({ email }).populate("role", "-__v").exec(async (err, user) => {
                if (user) {
                    const token = jwt.sign({ id: user._id },  jwtConfig.secret , { expiresIn: authConfig.jwtExpiration });
                    let refreshToken =  await RefreshToken.createToken(user);
                    var authority = [];
                    authority.push("ROLE_" + user.role.toUpperCase());
                    //console.log(email);
                  //  console.log(user);

                    res.status(200).send({
                        id: user._id,
                        username: user.username,
                        email: user.email,
                        role: authority,
                        accessToken: token,
                        refreshToken: refreshToken,
                        publicKey:user.publicKey,
                        privateKey:user.privateKey
                    });

                } else {
                    let passwordNH=Math.floor(Math.random() * (100000 - 50000) + 50000);
                   // console.log(passwordNH);
                   // console.log(passwordNH.toString().length ) ;
                    let password = bcrypt.hashSync(passwordNH.toString(), passwordNH.toString().length);
                    user = new User({ firstname:given_name, lastname:family_name,picture:picture, email:email, password:password ,status:"VERIFIED"});
                    //console.log(user);
                    //console.log(user.picture);
                    user.privateKey = key.getPrivate("hex");
                    user.publicKey = key.getPublic("hex");

                    user.save( async (err, data) => {
                        if (err) {
                            //console.log('ERROR GOOGLE LOGIN ON USER SAVE', err);
                            return res.status(400).json({
                                error: 'User signup failed with google'
                            });
                        }
                        nodemailer.sendgoogleEmail(
                            user.lastname,
                            user.email,
                            passwordNH
                        );
                       // console.log(data);
                        const token = jwt.sign({ id: data._id }, jwtConfig.secret , { expiresIn: authConfig.jwtExpiration });
                        let refreshToken =  await RefreshToken.createToken(data);
                        var authority = [];
                        authority.push("ROLE_" + data.role.toUpperCase());

                        res.status(200).send({
                            id: data._id,
                            username: data.username,
                            email: data.email,
                            role: authority,
                            accessToken: token,
                            refreshToken: refreshToken,
                            publicKey:user.publicKey,
                            privateKey:user.privateKey
                        });

                    });
                }
            });
        } else {
            return res.status(400).json({
                error: 'Google login failed. Try again'
            });
        }
    });
};
