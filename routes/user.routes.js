const express = require('express');
const router = express.Router();
const authJwt = require("../middlewares/authJwt");
const verifySignUp = require("../middlewares/verifySignUp");
const userController = require("../controllers/User.controller");
const authController = require("../controllers/auth.controller");

router.post("/refreshtoken", authController.refreshToken);

router.get("/test/all", userController.allAccess);

router.get(
    "/test/client",
    [authJwt.verifyToken, authJwt.isClient],
    userController.clientAccess
);
router.get(
    "/test/sub",
    [authJwt.verifyToken, authJwt.isSubscriber],
    userController.subscriberAccess
);
router.get(
    "/test/delivery",
    [authJwt.verifyToken, authJwt.isDeliveryMan],
    userController.deliverymanAccess
);
router.get(
    "/test/admin",
    [authJwt.verifyToken, authJwt.isAdmin],
    userController.adminAccess
);
router.get(
    "/test/superadmin",
    [authJwt.verifyToken, authJwt.isSuperAdmin],
    userController.superadminAccess
);

router.get(
    "/test/adminorsuperadmin",
    [authJwt.verifyToken, authJwt.isSuperAdminOrAdmin],
    userController.AdminOrSuperAdminAccess
);

const parser = require("../middlewares/cloudinary.config");

router.post(
    "/create", parser.single("picture"),[verifySignUp.checkDuplicateEmail, verifySignUp.checkRoleExisted],
    userController.create
);
router.get("/findall", userController.findAll);

router.get(
    "/findone/:id",
    //commentithom bech najem nekhdm maghyr JWT ZEIDI !!
    // [authJwt.verifyToken, authJwt.isSuperAdmin],
    userController.findOne
);


router.put("/updateone/:id", parser.single("picture"), userController.update);
router.put("/updateonestatus/:id", userController.updateStatus);

router.delete("/deleteone/:id", userController.delete);


router.put('/updateForDeliveryMan/:id',userController.updateForDeliveryMan);


router.put('/update/payement/:id',userController.updatePaiement);
router.put('/update/payementD/:id',userController.updatePaiementDeliv
);
router.put('/update/payementS/:id',userController.updatePaiementSeller
);
router.put('/update/payementBOT/:id',userController.updatePaiementBOT

);


module.exports = router

