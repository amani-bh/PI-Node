const express = require("express");
const route = express.Router();
const controller = require("../controllers/blockchain.controller");

route.post("/addTransaction/:privateKey", controller.addTransaction);
route.get("/getBalance/:address", controller.getBalance);
route.get(
  "/getAllTransactionsForWallet/:address",
  controller.getAllTransactionsForWallet
);
route.get("/getAllTransactions", controller.getAllTransactions);

route.post("/systemMine", controller.systemMine);

module.exports = route;
