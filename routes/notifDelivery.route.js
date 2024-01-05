const express = require('express');
const route = express.Router();
const controller = require('../controllers/notifDelivery.controller')
route.get('/getNotif/:id',controller.getMessage);
route.post ('/postNotif',controller.postMessage);
route.delete('/deleteNotif/:id',controller.deleteMessage);
route.put('/modifNotif/:id',controller.modifMessage);
module.exports = route;