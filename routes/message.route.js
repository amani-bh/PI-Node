const router = require("express").Router();
const controller = require("../controllers/message.controller");

//Api
//router.post('/add',verify,controller.create);

router.post("/add", controller.create);
router.post("/createChatAndMessage", controller.createChatAndMessage);

router.get(
  "/getMessagesFromConversation/:conversationId/:userId",
  controller.getMessagesFromConversation
);
router.get(
  "/seenConversation/:conversationId/:userId",
  controller.seenConversation
);

router.get("/getLastMessage/:id", controller.getLastMessage);
router.put("/removeMessage/:id", controller.removeMessage);
router.put("/likeMessage/:id", controller.likeMessage);

module.exports = router;
