var Card = require('../models/Card.model');
var Product = require('../models/Product.model');
let orderModel = require("../models/Order.model");

/* add card and add product to card */
// this function is added by zeidi to validate paiement
exports.updatePaiement=(req,res) => {

  Card.findByIdAndUpdate(req.params.id,{paid:true,total:req.body.total}).then(
    res.end('update with success')
  )

}

exports.create = async (req, res) => {
    const product = await Product.findById(req.params.idP);
    const card = await Card.find({ client: req.params.idU, is_deleted: false });
    const existe = await Card.find({ client: req.params.idU,products: { $elemMatch: { _id: req.params.idP } } });
    if (card.length != 0) {
        if (existe.length != 0) {
            res.json(existe);

        } else {
            // console.log(" product n'existe pas");
            Card.findOneAndUpdate({ client: req.params.idU, is_deleted: false }, { $push: { products: product }, $inc: { total: product.price } }).then(card => {
                res.json(card);
            }).catch(err => {
                res.status(500).send({ message: err.message })
            })
        }




    } else {

        const card = new Card({
            total: product.price,
            is_deleted: false,
            date: new Date(),
            client: req.params.idU,
            products: product

        });
        try {
            const c = await card.save();
            // console.log(c)
            res.status(201).json(c)
        } catch (err) {
            res.status(400).json({ message: err.message })
        }


    }
}
/* remove product from card */
exports.remove_Product = async (req, res) => {
    const card = await Card.find({ client: req.params.idU, is_deleted: false });
    const product = await Product.findById(req.params.idP);
    Card.findOneAndUpdate({ client: req.params.idU, is_deleted: false }, { $pull: { products: { _id: product._id } }, $inc: { total: -product.price } })
        .then(card => {
            res.json(card);
        }).catch(err => {
            res.status(500).send({ message: err.message })
        })

}

/* get all cards */
exports.find_All = (req, res) => {
  Card.find()
    .then((card) => {
      res.json(card);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};
/* get card by client id */
exports.findByIdUser=(req,res)=>{
  Card.findOne({client: req.params.idU}).then(card=>{
      res.json(card)
  }).catch(err => {
      res.status(500).send({ message: err.message })
  })
}

/* get card by id card */
exports.findByIdCard = (req, res) => {
  Card.find({ _id: req.params.idCard })
    .then((card) => {
      res.json(card);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

/* update shipped in card */
exports.update = async (req, res) => {
  const product = await Product.findById(req.params.idP);
  product.shipped = true;
  // this line is updated by zeidi
  var loadTracker = 0;
  await orderModel
    .findById(req.params.idOrder)
    .then((data) => (loadTracker = data.loadTracker));
  await orderModel.findByIdAndUpdate(req.params.idOrder, {
    loadTracker: loadTracker + 1,
  });
  const c = await Card.findOneAndUpdate(
    { products: { $elemMatch: { _id: req.params.idP } } },
    { $pull: { products: { _id: product._id } } }
  );

  Card.findOneAndUpdate(
    { _id: req.params.idC },
    { $push: { products: product } }
  )
    .then((card) => {
      res.json(card);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

/* get product count in cards   */
exports.countProducts=async(req,res)=>{
  const nbr=await Card.find({ products: { $elemMatch: { _id: req.params.idP } } }).count()
  try {
    res.json(nbr)
    
  } catch (error) {
    res.status(500).send({ message: error.message });
  }}


exports.deleteCard =(req,res)=>{
  Card.findByIdAndUpdate(req.params.id,{total:0,products:[]}).then(res.json('success'))

}