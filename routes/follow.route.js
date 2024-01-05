const router = require("express").Router();
const controller = require("../controllers/follow.controller");

router.put("/follow", controller.follow);
router.get("/checkFollow/:currentUserId/:friendId", controller.checkFollow);
router.put("/unfollow", controller.unfollow);

module.exports = router;
