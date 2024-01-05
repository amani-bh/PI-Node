const express = require('express');
const router = express.Router()
const controller = require('../controllers/product.controller');
const parser = require("../middlewares/cloudinary.config");



router.post('/addProduct/:idU',parser.array("picture"), controller.create);
router.get('/getProducts',controller.find_products);
router.get('/getOneProduct/:id',controller.find);
router.put('/updateProduct/:id',parser.array("picture"),controller.update);
router.get('/deleteProduct/:id',controller.deleteProduct);
router.get('/getProductsByCategory/:catg',controller.find_products_category);
router.put('/soldProduct/:id',controller.soldProduct);
router.get('/getProductsUser/:idU',controller.getProductUser);
router.get('/getProductNotSold/:idU',controller.getProductNotSold);
router.get('/addRecentProduct/:idU/:idP',controller.addRecentProduct);
router.get('/getRecentVisitedProductsUser/:idU',controller.getRecentVisitedProductsUser);
router.get('/addToWishlist/:idU/:idP',controller.addToWishlist);
router.get('/getProductsWishlist/:idU',controller.getProductsWishlist);
router.get('/removeProductFromWishlist/:idU/:idP',controller.removeProductFromWishlist);
router.get('/getCountProductWishlist/:idP',controller.getCountProductWishlist);
router.get('/getNbrOfViews/:idP',controller.getNbrOfViews);
router.get('/emotion/:idP',controller.updateEmotion);
router.get('/getProductWithNoEmotions',controller.getProductWithnNoEmotion);
router.get('/updateProductAmazon/:idP',controller.updateAmazonProduct);
router.get('/getProductsAmazon',controller.getProductAmazon);
module.exports = router