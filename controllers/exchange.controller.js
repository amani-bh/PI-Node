const Exchange = require("../models/Exchange.model");
const Product = require("../models/Product.model");

exports.create = async (req, res) => {
  if (!req.body) {
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }

  const exchange = new Exchange({
    userReciever: req.body.userReciever,
    userSender: req.body.userSender,
    productReciever: req.body.productReciever,
    productSender: req.body.productSender,
    amount: req.body.amount,
  });

  exchange
    .save(exchange)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occured while creating a create operation",
      });
    });
};

exports.update = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: " Data to update can not be empty!",
    });
  }

  const id = req.params.id;

  Exchange.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `Cannot update exchane with id=${id}.Exchange was not found!`,
        });
      } else res.send({ message: "Exchange was updated successfully." });
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating Exchange with id=" + id,
      });
    });
};

exports.confirm = async (req, res) => {
  const id = req.params.id;

  const doesExist = await Exchange.findById(id);

  // if (doesExist.confirm.value == true) {
  //   const currentDate = Date.now() / 1000;
  //   if (currentDate - doesExist.confirm.confirmAt / 1000 < 3600) {
  //     await Exchange.findByIdAndUpdate(id, {
  //       confirm: { value: false, confirmAt: Date.now() },
  //     },{status:'CONFIRMED'});
  //     await Product.findByIdAndUpdate(doesExist.productReciever._id, {
  //       sold: false,
  //     });
  //     await Product.findByIdAndUpdate(doesExist.productSender._id, {
  //       sold: false,
  //     });

  //     res.send("False");
  //   } else {
  //     res.send("Impossible");
  //   }
  // } else {
  await Product.findByIdAndUpdate(doesExist.productReciever._id, {
    sold: true,
  });
  await Product.findByIdAndUpdate(doesExist.productSender._id, {
    sold: true,
  });

  doesExist.confirm.value = true;
  doesExist.confirm.confirmAt = Date.now();
  doesExist.status = "CONFIRMED";
  doesExist.productReciever.sold = true;
  doesExist.productSender.sold = true;

  await Exchange.updateMany(
    {
      
      $and:[{status:"ACTIVE"},{

        $or: [
          { "productReciever._id": doesExist.productReciever._id },
          { "productReciever._id": doesExist.productSender._id },
          { "productSender._id": doesExist.productSender._id },
          { "productSender._id": doesExist.productReciever._id },
        ]

      }]
    },

    { status: "DECLINED" }
  );

  await Exchange.findByIdAndUpdate(id, doesExist)

    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `Cannot Confirm exchane with id=${id}.Exchange was not found!`,
        });
      } else res.send("True");
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating Exchange with id=" + id,
      });
    });
};

exports.delete = async (req, res) => {
  const id = req.params.id;

  const doesExist = await Exchange.findById(id);

  if (doesExist.confirm.value == null) {
    await Exchange.findByIdAndUpdate(id, {
      status: "DELETED",
    });

    res.send("Deleted");
  } else {
    res.send("Impossible");
  }
};

exports.decline = async (req, res) => {
  const id = req.params.id;

  const doesExist = await Exchange.findById(id);

  if (doesExist.confirm.value == null) {
    await Exchange.findByIdAndUpdate(id, {
      status: "DECLINED",
      confirm: { value: false, confirmAt: Date.now() },
    });

    res.send("DECLINED");
  } else {
    res.send("Impossible");
  }
};

exports.getMyExchanges = async (req, res) => {
  const exchanges = await Exchange.find({ userSender: req.params.id })
    .sort({ date: -1 })
    .then()
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
  res.send(exchanges);
};
exports.getExchangesRequest = async (req, res) => {
  const exchanges = await Exchange.find({ userReciever: req.params.id })
    .sort({ date: -1 })
    .then()
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
  res.send(exchanges);
};
