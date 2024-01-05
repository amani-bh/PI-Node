exports.allAccess = (req, res) => {
  res.status(200).send("Public Access.");
};

exports.superadminAccess = (req, res) => {
  res.status(200).send("SUPER_ADMIN Access.");
};

exports.adminAccess = (req, res) => {
  res.status(200).send("Admin Access.");
};

exports.deliverymanAccess = (req, res) => {
  res.status(200).send("DELIVERY_MAN Access.");
};

exports.subscriberAccess = (req, res) => {
  res.status(200).send("SUBSCRIBER Access.");
};

exports.clientAccess = (req, res) => {
  res.status(200).send("Client Access.");
};

exports.AdminOrSuperAdminAccess = (req, res) => {
  res.status(200).send("Admin Or SuperAdmin Access.");
};

const User = require("../models/User.model");
const Roles = ["SUPER_ADMIN", "ADMIN", "CLIENT", "SUBSCRIBER", "DELIVERY_MAN"];
const bcrypt = require("bcryptjs");
const config = require("../config/auth.config");
const nodemailer = require("../config/nodemailer.config");
var jwt = require("jsonwebtoken");
const { systemMines } = require("./blockchain.controller");
const EC = require("elliptic").ec;
const ec = new EC("secp256k1");
const key = ec.genKeyPair();
const {  addTransactions } = require("./blockchain.controller");


exports.create = (req, res) => {
  const token = jwt.sign({ email: req.body.email }, config.secret);

  let user;
  if (typeof req.body.status !== "undefined") {
    user = new User({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      phone_number: req.body.phone_number,
      address: req.body.address,
      location: { larg: req.body.larg, long: req.body.long },
      solde: req.body.solde,
      password: bcrypt.hashSync(req.body.password, req.body.password.length),
      picture: req.file.path,
      status: req.body.status,
      verify_token: token,
    });
  } else {
    user = new User({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      picture: req.file.path,
      email: req.body.email,
      phone_number: req.body.phone_number,
      address: req.body.address,
      location: { larg: req.body.larg, long: req.body.long },
      solde: req.body.solde,
      password: bcrypt.hashSync(req.body.password, req.body.password.length),
      verify_token: token,
    });
  }
  user.privateKey = key.getPrivate("hex");
  user.publicKey = key.getPublic("hex");
  systemMines(user.publicKey,100);

  user.save((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    if (req.body.role) {
      // console.log(req.body.role.toUpperCase());
      if (!Roles.includes(req.body.role.toUpperCase())) {
        res.status(400).send({
          message: `Failed! Role ${req.body.role} does not exist!`,
        });
        return;
      } else {
        //  console.log(req.body.role.toUpperCase());
        user.role = req.body.role.toUpperCase();
        user.save((err) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }

          res.send({ message: "User was created successfully!" });
          nodemailer.sendConfirmationEmail(
            user.lastname,
            user.email,
            user.verify_token
          );
        });
      }
    } else {
      user.role = "CLIENT";
      user.save((err) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        res.send({ message: "User was created successfully!" });
        nodemailer.sendConfirmationEmail(
          user.lastname,
          user.email,
          user.verify_token
        );
      });
    }
  });
};

// Retrieve all Users from the database.
exports.findAll = (req, res) => {
  User.find()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving users.",
      });
    });
};

// Find a single User with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  User.findById(id)
    .then((data) => {
      if (!data)
        res.status(404).send({ message: "Not found User with id " + id });
      else res.send(data);
    })
    .catch((err) => {
      res.status(500).send({ message: "Error retrieving User with id=" + id });
    });
};

// Update a User by the id in the request
exports.update = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "User Data to update can not be empty!",
    });
  }

  const id = req.params.id;

  //console.log(id);
  //console.log(req.body);
  var user = req.body;
  user.picture = req.file.path;
  const passwordHashed = bcrypt.hashSync(user.password, user.password.length);
  user.password = passwordHashed;
  //console.log(user);

  User.findByIdAndUpdate(id, user, { useFindAndModify: false })
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `Cannot update User with id=${id}.User was not found!`,
        });
      } else res.send({ message: "User was updated successfully." });
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating User with id=" + id,
      });
    });
};

// Update a User Status by the id in the request
exports.updateStatus = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "User Data to update can not be empty!",
    });
  }

  const id = req.params.id;

  //console.log(id);
  //console.log(req.body);
  var user = req.body;

  //console.log(user);

  User.findByIdAndUpdate(id, user, { useFindAndModify: false })
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `Cannot update User with id=${id}.User was not found!`,
        });
      } else res.send({ message: "User was updated successfully." });
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating User with id=" + id,
      });
    });
};

// Delete a User with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  User.findByIdAndRemove(id, { useFindAndModify: false })
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `Cannot delete User with id=${id}. User was not found!`,
        });
      } else {
        res.send({
          message: "User was deleted successfully!",
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete User with id=" + id,
      });
    });
};

exports.updateForDeliveryMan = async (req, res) => {
  var s = 0;

  await User.findById(req.params.id).then(
    (data) => (s = data.solde + parseInt(req.body.solde.match(/(\d+)/)[0]))
  );
  User.findByIdAndUpdate(req.params.id, {
    hazard: true,
    dateHazard: new Date(),
    solde: s,
  }).then((data) => res.send(data));
};

// this line is added by zeidi


exports.updatePaiement = async (req, res) => {
  var s = 0;

  await User.findById(req.params.id).then(
    (data) => (s = data.solde - req.body.solde)
  );





  User.findByIdAndUpdate(req.params.id, {
    solde: s,
  }).then((data) => res.send(data));
};

exports.updatePaiementDeliv = async (req, res) => {
  var s = 0;
  await User.findById(req.params.id).then(
    (data) => (s = data.solde + parseInt(req.body.solde.match(/(\d+)/)[0]))
  );
  User.findByIdAndUpdate(req.params.id, {
    solde: s,
  }).then((data) => res.send(data));
};

exports.updatePaiementSeller = async (req, res) => {
  var s = 0;

  await User.findById(req.params.id).then(
    (data) => (s = data.solde + req.body.solde)
  );
  User.findByIdAndUpdate(req.params.id, {
    solde: s,
  }).then((data) => res.send(data));
};

exports.updatePaiementBOT = async (req, res) => {
  var s = 0;

  await User.findById(req.params.id).then((data) => (s = data.solde + 1));
  User.findByIdAndUpdate(req.params.id, {
    solde: s,
    trackBot: true,
  }).then((data) => res.send(data));
};
