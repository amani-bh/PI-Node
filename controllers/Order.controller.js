//declaration :
const model = require("../models/Order.model");
var mongoose = require("mongoose");
const Product = require("../models/Product.model");

//login :
const activate = (req, res) => {
  const b = req.body.items;
  const c = b.substring(0, b.length - 2);
  model
    .findByIdAndUpdate(req.params.id, {
      activation: true,
      items: new mongoose.Types.ObjectId(b),
      cost: req.body.cost,
      article: req.body.article,
      load: req.body.load,
    })
    .then(res.end("success"));
};
const updatingOrderFinisher = async (req, res) => {
  var loadTracker = 0;
  await model
    .findById(req.params.id)
    .then((data) => (loadTracker = data.loadTracker));
  await model.findByIdAndUpdate(req.params.id, {
    loadTracker: loadTracker + 1,
  });

  model.findByIdAndUpdate(
    req.params.id,
    {
      _id: req.params.id,
      status: "delivered",
      shippedDate: new Date(),
    },
    (err, data) => {
      if (err) res.json("err");
      else res.json(data);
    }
  );
};
const updatingOrderInitiliser = (req, res) => {
  console.log(req.params.id);
  model.findByIdAndUpdate(
    req.params.id,
    { status: "in progress", delID: req.body.delID, shippedDate: null },
    (err, data) => {
      if (err) {
        res.json("err");
      } else res.json(data);
    }
  );
};
const postingOrder = (req, res) => {
  let poster = new model({
    date: new Date(),
    telephone: req.body.telephone,
    firstName: req.body.firstName,
    description: req.body.description,
    items: req.body.items,
    products: req.body.products,
    locationClient: req.body.locationClient,
    status: "not taken",
    delID: null,
    load: req.body.load,
    clientID: req.body.clientID,
    shippedDate: null,
    cost: req.body.cost,
  });
  poster.save();
  res.json(poster);
  postingOrder;
};

const retreiveAllOrders = (req, res) => {
  model.find((err, data) => {
    if (err) res.json("error");
    else res.json(data);
  });
};

const retreiveByDeliveryMan = (req, res) => {
  model.find((er, data) => {
    const d = data.filter((d) => {
      return d.delID == req.params.id;
    });

    if (er) res.json("err");
    else res.json(d);
  });
};
const retreiveByClient = (req, res) => {
  model.find((er, data) => {
    const d = data.filter((d) => {
      return d.clientID == req.params.id;
    });

    if (er) res.json("err");
    else res.json(d);
  });
};
//exporting :
update = async (req, res) => {
  console.log(req.params.idP)
  const product = await Product.findById(req.params.idP);
console.log (product)
  var loadTracker = 0;
  await model
    .findById(req.params.idOrder)
    .then((data) => (loadTracker = data.loadTracker));
  await model.findByIdAndUpdate(req.params.idOrder, {
    loadTracker: loadTracker + 1,
  });

  product.shipped = true;
  const c = await model.findOneAndUpdate(
    { _id: req.params.idC },
    { $pull: { products: { _id: req.params.idP } } }
  );

  await model
    .findOneAndUpdate(
      { _id: req.params.idOrder },
      { $push: { products: product } }
    )
    .then((card) => {
      res.json(card);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};
module.exports = {
  update,
  postingOrder,
  updatingOrderInitiliser,
  updatingOrderFinisher,
  retreiveAllOrders,
  retreiveByDeliveryMan,
  retreiveByClient,
  activate,
};