const Message = require("../models/Message.model");
const Chat = require("../models/Chat.model");

const User = require("../models/User.model");
const encrypt = require("ncrypt-js");
const chatController = require("../controllers/chat.controller");

const _secretKey = "klhjzebhnerpg";
const ncryptObject = new encrypt(_secretKey);

//send message
exports.create = async (req, res) => {
  if (!req.body) {
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }

  const message = new Message({
    chat: req.body.chat,

    sender: req.body.sender,
    receiver: req.body.receiver,
  });
  if (req.body.audio) {
    message.audio = req.body.audio.base64;
    message.content = null;
  }
  if (req.body.content) {
    message.content = ncryptObject.encrypt(req.body.content);
  }
  console.log(message.content);

  const senderId = req.body.sender;
  const sender = await User.findOne({ _id: senderId });

  const chat = await Chat.findByIdAndUpdate(req.body.chat, {
    lastActivity: Date.now(),
  });

  await sender.update({
    lastActivity: Date.now(),
  });

  message
    .save(message)
    .then((data) => {
      if (data.content) data.content = ncryptObject.decrypt(data.content);

      res.send(data);
      console.log(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occured while creating a create operation",
      });
    });
};

exports.createChatAndMessage = async (req, res) => {
  const chat = new Chat({
    first: req.body.sender,
    second: req.body.receiver,
    product: req.body.product,
    lastActivity: Date.now(),
  });

  chat
    .save(chat)
    .then((e) => {
      chat = e;
    })
    .catch((err) => {
      return err;
    });

  if (!req.body) {
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }

  const message = new Message({
    chat: chat._id,
    sender: req.body.sender,
    receiver: req.body.receiver,
    content: ncryptObject.encrypt(req.body.content),
  });

  const senderId = req.body.sender;
  const sender = await User.findOne({ _id: senderId });

  await sender.update({
    lastActivity: Date.now(),
  });

  message
    .save(message)
    .then((data) => {
      data.content = ncryptObject.decrypt(data.content);
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occured while creating a create operation",
      });
    });
};

//get messages from conversation

exports.getMessagesFromConversation = async (req, res) => {
  const conversationId = req.params.conversationId;
  const userId = req.params.userId;

  try {
    const messages = await Message.find({ chat: conversationId });
    messages.forEach(function (message) {
      //decryper les messages
      if (message.content)
        message.content = ncryptObject.decrypt(message.content);
    });

    const lastMessage = messages[messages.length - 1];
    const message = await Message.findOneAndUpdate(
      { $and: [{ _id: lastMessage._id }, { receiver: userId }] },
      { seen: { value: true, seenAt: Date.now() } }
    );

    res.status(200).send(messages);
  } catch (err) {
    res.status(500).send({ message: "Not Found" });
  }
};

exports.getLastMessage = async (req, res) => {
  conversationId = req.params.id;

  try {
    const messages = await Message.find({ chat: conversationId });
    messages.forEach(function (message) {
      //decryper les messages
      if (message.content)
        message.content = ncryptObject.decrypt(message.content);
    });

    res.status(200).send(messages[messages.length - 1]);
  } catch (err) {
    res.status(500).send({ message: "Not Found" });
  }
};

exports.seenConversation = async (req, res) => {
  const conversationId = req.params.conversationId;
  const userId = req.params.userId;

  try {
    const messages = await Message.find({
      chat: conversationId,
      receiver: userId,
    });

    if (messages.length == 0) {
      res.status(200).send(true);
    } else {
      const lastMessage = messages[messages.length - 1];

      res.status(200).send(lastMessage.seen.value);
    }
  } catch (err) {
    res.status(500).send({ message: "Not Found" });
  }
};

exports.removeMessage = async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(req.params.id, {
      removed: true,
    });

    res.status(200).send(message);
  } catch (err) {
    res.status(500).send({ message: "Not Found" });
  }
};
exports.likeMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    message.like = !message.like;
    const messageToChange = await Message.findByIdAndUpdate(
      req.params.id,
      message
    );

    res.status(200).send(!messageToChange.like);
  } catch (err) {
    res.status(500).send({ message: "Not Found" });
  }
};
