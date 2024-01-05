const User = require("../models/User.model");
const Chat = require("../models/Chat.model");
const chatController = require("../controllers/chat.controller");





// follower user 
exports.follow = async (req, res) => {
  if (!req.body) {
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }

  const currentUserId = req.body.currentUser;
  const friendUserId = req.body.friendUser;

  const currentUser = await User.findOne({ _id: currentUserId });
  const friendUser = await User.findOne({ _id: friendUserId });
  console.log(friendUser);
  if (currentUser && friendUser) {
    const found = await User.findOne({
      _id: currentUser._id,
      followings: friendUser._id,
    });

    if (found) {
      res.status(200).send({ message: "failed" });
    } else {
      await currentUser.update({ $push: { followings: friendUser._id } });
      await friendUser.update({ $push: { followers: currentUser._id } });

      const chat = new Chat({
        first: currentUserId,
        second: friendUser,
      });

      





      chatController.createChat(chat);

      res.status(200).send({ message: "success",followersCount:friendUser.followers.length+1 });
    }
  } else {
    res.status(404).send({ message: "Users not found" });
  }

  // res.send(currentUser);
};

// check relation between two users
exports.checkFollow = async (req, res) => {
  if (!req.body) {
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }

  const currentUserId = req.params.currentUserId;
  const friendUserId = req.params.friendId;
 

  const currentUser = await User.findOne({ _id: currentUserId });
  const friendUser = await User.findOne({ _id: friendUserId });

  if (currentUser && friendUser) {
    const found = await User.findOne({
      _id: currentUser._id,
      followings: friendUser._id,
    });
    if (found) {
      res.status(200).send(true);
      return;
    }
    res.status(200).send(false);
  } else {
    res.status(404).send({ message: "Users not found" });
  }
};
//unfollow user 
exports.unfollow = async (req, res) => {
  if (!req.body) {
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }

  const currentUserId = req.body.currentUser;
  const friendUserId = req.body.friendUser;

  const currentUser = await User.findOne({ _id: currentUserId });
  const friendUser = await User.findOne({ _id: friendUserId });

  if (currentUser && friendUser) {
    const found = await User.findOne({
      _id: currentUser._id,
      followings: friendUser._id,
    });
    const first = await currentUser.update({
      $pull: { followings: friendUser._id },
    });

    const second = await friendUser.update({
      $pull: { followers: currentUser._id },
    });
    if (first.modifiedCount != 0 && second.modifiedCount != 0) {
      res.status(200).send({ message: "success",followersCount:friendUser.followers.length-1 });
    } else {
      res.status(200).send({ message: "Already followed" });
    }
  } else {
    res.status(404).send({ message: "Users not found" });
  }
};
