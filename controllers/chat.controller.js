const Chat = require("../models/Chat.model");
const User = require("../models/User.model");


//Create a new chat

exports.createChat =  (chat) => {
  const found = Chat.findOne({
    $or: [
      {
        $and: [
          { first: chat.first },
          { second: chat.second },
          { product: chat.product },
        ],
      },
      {
        $and: [
          { first: chat.second },
          { second: chat.first },
          { product: chat.product },
        ],
      },
    ],
  }).then((data) => {
   
    if (data != null) {

      return false;
    } else {
      chat
        .save(chat)
        .then((e) => {

          return e;

        })
        .catch((err) => {
          return err;
        });
    }
  });
};


exports.create = async (req, res) => {
  if (!req.body) {
    res.status(400).send({ message: "Content can not be empty!" });
    return false;
  }
  const chat = new Chat({
    first: req.body.first,
    second: req.body.second,
    product: req.body.product,
  });
  const  result =    await createChat(chat).then((e=>console.log(e)));

  

  if (result) {
    res.send({ message: result });
    
  } else {
    res.status(500).send({
      message: "Some error occured while creating a create operation",
    });
  }
};

exports.chatExist = async (req, res) => {
  if (!req.body) {
    res.status(400).send({ message: "Content can not be empty!" });
    return false;
  }
  const found = Chat.findOne({
    $or: [
      {
        $and: [
          { first: req.body.first },
          { second: req.body.second },
          { product: req.body.product },
        ],
      },
      {
        $and: [
          { first: req.body.second },
          { second: req.body.first },
          { product: req.body.product },
        ],
      },
    ],
  }).then((data) => {
    if (data != null) {
      res.send(true);

      return true;
    } else {
      res.send(false);

      return false;
    }
  });
};

// get chat from user
exports.getChatFromUser = async (req, res) => {
  const userId = req.params.id;
  try {
    const chat = await Chat.find({
      $or: [{ first: userId }, { second: userId }],
    }).sort({lastActivity:-1});

    res.status(200).send(chat);
  } catch (err) {
    res.status(400).send({ message: "Not Found" });
  }
};

//find user by id

exports.findUserById = (req, res) => {
  if (req.query.id) {
    const id = req.query.id;
    User.findById(id)
      .then((data) => {
        if (!data) {
          res.status(404).send({ message: "Not found user with id" + id });
        } else {
          res.send(data);
        }
      })
      .catch((err) => {
        res
          .status(500)
          .send({ message: "Error retrieving user with id " + id });
      });
  } else {
    User.find()
      .then((user) => {
        res.send(user);
      })
      .catch((err) => {
        res.status(500).send({
          message:
            err.message || "Error Occured while retriving user Information",
        });
      });
  }
};