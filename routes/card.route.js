const express = require('express');
const route = express.Router()
const controller = require('../controllers/card.controller');

//route.post('/addProduct/:idC/:idU', controller.create_product);
//route.post('/addcard', controller.create_card);
route.post('/addProductToCard/:idU/:idP', controller.create);
route.put('/RemoveProductFromCard/:idU/:idP', controller.remove_Product);
route.get('/getAllCards',controller.find_All);
route.get('/getCardByIdUser/:idU',controller.findByIdUser);
route.get('/getCard/:idCard',controller.findByIdCard);
route.put('/updateProductCard/:idP/:idC/:idOrder',controller.update);
route.put ('/update/paiement/:id',controller.updatePaiement)
route.get('/getCount/:idP',controller.countProducts);
route.put('/delete/:id',controller.deleteCard) 
module.exports = route