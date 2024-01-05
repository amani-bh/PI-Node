//declaration :
const express = require("express");
const order = express.Router();
const controller = require("../controllers/Order.controller");
//routers :
order.get("/get/all", controller.retreiveAllOrders);
order.get("/get/ByDeliveryMan/:id", controller.retreiveByDeliveryMan);
order.get("/get/ByClient/:id", controller.retreiveByClient);
order.post("/post", controller.postingOrder);
order.put("/update/activate/:id", controller.activate);
order.put("/update/starter/:id", controller.updatingOrderInitiliser);
order.put("/update/finisher/:id", controller.updatingOrderFinisher);
order.put('/updateProductOrder/:idP/:idC/:idOrder',controller.update);

//exporting :
module.exports = order;
