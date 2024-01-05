const express = require('express');
const router = express.Router()
const controller = require('../controllers/review.controller');

router.post('/addReview/:idU/:idP',controller.create);
router.put('/updateReview/:idU/:idP',controller.update);
router.put('/removeReview/:idU/:idP',controller.delete);
router.get('/getReviewsOfProduct/:idP',controller.find);
router.get('/getReviewsOfProductUser/:idP',controller.findPU);

module.exports = router
