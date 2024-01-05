const router = require("express").Router();
const controller = require("../controllers/exchange.controller");

//Api
//router.post('/add',verify,controller.create);

router.post("/add", controller.create);
router.put("/update/:id", controller.update);
router.put("/confirm/:id", controller.confirm);
router.put("/delete/:id", controller.delete);
router.put("/decline/:id", controller.decline);

router.get("/getMyExchanges/:id", controller.getMyExchanges);
router.get("/getExchangesRequest/:id", controller.getExchangesRequest);


module.exports = router;
