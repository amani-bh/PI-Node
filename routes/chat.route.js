const router = require("express").Router();
const controller = require("../controllers/chat.controller");

//Api
//router.post('/add',verify,controller.create);

router.post("/add", controller.create);
router.put("/chatExist", controller.chatExist);

router.get("/getChatFromUser/:id", controller.getChatFromUser);

router.get("/findUserById", controller.findUserById);

module.exports = router;
