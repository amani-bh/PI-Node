const express = require('express');
const router = express.Router();
verifySignUp  = require("../middlewares/verifySignUp");
const authController = require("../controllers/auth.controller");
const User = require("../models/User.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authConfig = require("../config/auth.config");
const RefreshToken = require("../models/RefreshToken.model");

router.post("/signup", [verifySignUp.checkDuplicateEmail, verifySignUp.checkRoleExisted], authController.signup);

router.post("/signin", authController.signin);
router.post("/signinFace", authController.signinFace);

router.post("/refreshtoken", authController.refreshToken);

router.get("/confirm/:verify_token", authController.verifyUser);

router.put('/forgot-password', authController.forgotPassword);

router.put('/reset-password', authController.resetPassword);

router.post('/google-login', authController.googleLogin);


module.exports = router
