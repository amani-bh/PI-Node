const res = require("express/lib/response");
const Event = require("../models/Event.model");
const Product = require("../models/Product.model");
const User = require("../models/User.model");
const { getBalances, addTransactions } = require("./blockchain.controller");

//Create a new event
exports.createEvent = async (req, res) => {
      console.log(req.file.path)
  if (!req.body) {
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }
  const product = new Product({name:req.body.name,description:req.body.description,price:req.body.price,picture:req.file.path});
  product.auction_product = true;
  product.exchange = false;
  product.is_deleted = false;
  product
    .save(product)
    .then((data) => {
      const event = new Event({
        title: req.body.title,
        dateStart: "2022-03-05T21:07:58.076+00:00",
        dateEnd: "2022-05-05T21:07:58.076+00:00",
        description: req.body.description,
        category: req.body.category,
        costOfParticipation: req.body.costOfParticipation,
        startPrice: req.body.startPrice,
        numberOfParticipants: req.body.numberOfParticipants,
        product: data._id,
        bids: [],
        listOfParticipants: []
      });
      event
        .save(event)
        .then((d) => {
          res.send(d);
        })
        .catch((err) => {
          res.status(500).send({
            message:
              err.message || "Some error occured while creating a create operation : Event",
          });
        });
      //  res.status(200).send(event); 
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occured while creating a create operation : Event",
      });
    });
};

exports.updateEvent = async (req, res) => {
  console.log(req.body)
  if (!req.body) {
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }
  Event.findByIdAndUpdate(req.params.idEvent, req.body, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).send({ message: `Cannot Update Event with ${req.params.idEvent}. Maybe Event not found!` })
      } else {
        res.send("Event updated")
      }
    })
    .catch(err => {
      res.status(500).send({ message: "Error Update Event information" })
    })

}

exports.deleteEvent = async (req, res) => {
  let event = await Event.findById(req.params.idEvent);
  Product.findByIdAndRemove(event.product, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot delete Product with id=${event.product}. Event was not found!`
        });
      } else {
        Event.findByIdAndRemove(req.params.idEvent, { useFindAndModify: false })
          .then(data => {
            if (!data) {
              res.status(404).send({
                message: `Cannot delete Event with id=${req.params.idEvent}. Event was not found!`
              });
            } else {
              res.send({
                message: "Event was deleted successfully!"
              });
            }
          })
          .catch(err => {
            res.status(500).send({
              message: "Could not delete Event with id=" + req.params.idEvent
            });
          });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete Product with id=" + event.product
      });
    });

}

exports.AllEvents = async (req, res) => {

  Event.find({ is_activated: true }).sort({ dateStart: 1 })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: ` Events was not found! Error 404`
        });
      } else {
        res.json(data);
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not found Events Error 500"
      });
    });

}
exports.AllEventsFinished = async (req, res) => {

  Event.find({ is_activated: false }).sort({ dateStart: 1 })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: ` Events was not found! Error 404`
        });
      } else {
        res.json(data);
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not found Events Error 500"
      });
    });
}

exports.findEvent = async (req, res) => {
  let LastUser = new User({firstname:"no",lastname:"one"});
  const event = await Event.findOne({ _id: req.params.id});
  const product = await Product.findOne({ _id: event.product});
  event.product=product;
  if(event.bids.length>0){
  let bid=event.bids.reduce((max, obj) => (max.value > obj.value) ? max : obj)
   LastUser=await User.findOne({_id:bid.user})
}
      if (!event || !product) {
        res.status(404).send({
          message: ` Events was not found! with id=${req.params.id}`
        });
      } else {
        res.json({event,LastUser});
      }
   
}
exports.findEventBackOffice = async (req, res) => {
  const event = await Event.findOne({ _id: req.params.id});
  const product = await Product.findOne({ _id: event.product});
  let users= [];
  event.product=product;
  if(event.listOfParticipants.length>0){
    for(let i=0;event.listOfParticipants.length>=i;i++){
      users[i]= await User.findOne({ _id:event.listOfParticipants[i] })
    }
    event.listOfParticipants=users;
}
      if (!event || !product) {
        res.status(404).send({
          message: ` Events was not found! with id=${req.params.id}`
        });
      } else {
        res.json(event);
      }
}

exports.NextBids = async (req, res) => {
  const event = await Event.findOne({ _id: req.params.idEvent });
  const user = await User.findOne({ _id: req.body.idUser });
  if (event.dateStart < Date.now() && event.dateEnd > Date.now()) {

    if (req.body.value > getBalances(user.publicKey)) {
      res.status(404).send({
        message: ` insufficient balance`
      });
    }
    else {
        if (event.bids.length > 10) {
        let previousBids = event.bids.reduce((min, obj) => (min.value < obj.value) ? min : obj);
        event.bids.splice((event.bids.indexOf(previousBids)),1,{ user: req.body.idUser, value: event.finalPrice+req.body.value });
        }
        else{

        event.bids.push({ user: req.body.idUser, value: event.finalPrice+req.body.value });  
        }   
        event.finalPrice = event.finalPrice+req.body.value;
        await event.update(event);
        const result = await addTransactions(user.publicKey,"04834283c06b40a35af290b0ae0065e9c944d3c9ef3fd9af3117e37143d48b56a73899597fc982743135ac4f6ee1f2be978438c433429cc89e85edbd9922a24baa",req.body.value,user.privateKey);
        let all = event.bids;
        res.json({bid:event.bids.reduce((max, obj) => (max.value > obj.value) ? max : obj),user,all,result})
    }
  }
  else {
    if (event.dateStart > Date.now()) {
      res.status(404).send({
        message: ` Event does not start yet `
      });
    }
    else {
      res.status(404).send({
        message: ` Event is already over `
      });
    }
  }
}

exports.JoinEvent = async (req, res) => {
  const event = await Event.findOne({ _id: req.params.idEvent });
  const user = await User.findOne({ _id: req.params.idUser });
  let  status = false;
  if(event.listOfParticipants.length>0){
  for(let i=0;event.listOfParticipants.length>=i;i++){
    if(event.listOfParticipants[i]==req.params.idUser){
          res.status(404).send({
      message: ` User existe `
    });
    return status = true;
  }

  }
}
if(!status){
    if (user.solde >= event.costOfParticipation) {
      event.listOfParticipants.push(user._id);
      if(event.numberOfParticipants == event.listOfParticipants.length &&event.is_activated ){
        event.status="IN_PROGRESS";
        event.dateStart=Date.now();
        await event.update(event);
        user.solde = user.solde - event.costOfParticipation;
        await user.update(user);
        res.status(200).json(event)
      }
      else{
      await event.update(event);

      user.solde = user.solde - event.costOfParticipation;
      await user.update(user);
      res.status(200).json(event)
      }
    }
    else{
 if(event.is_activated == false){
  res.status(404).send({
    message: `Events is finshesd `
  });

 }
else{
  res.status(404).send({
    message: `lower amount `
  });
}
     
  }
  }

}


exports.EndEvent = async (req, res) => {
  const event = await Event.findOne({ _id: req.params.idEvent });
  event.status="FINISH";
  event.is_activated= false;
  event.dateEnd = Date.now();
  await event.update(event);
  res.status(200).json(event)
}

exports.All = async (req, res) => {

  Event.find().sort({ dateStart: 1 })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: ` Events was not found! Error 404`
        });
      } else {
        res.json(data);
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not found Events Error 500"
      });
    });

}