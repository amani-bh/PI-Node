const  user = require('../models/User.model');
const roles = ["SUPER_ADMIN", "ADMIN", "CLIENT","SUBSCRIBER","DELIVERY_MAN"];

checkDuplicateEmail = (req, res, next) => {

        user.findOne({
            email: req.body.email
        }).exec((err, user) => {
            if (err) {
                res.status(500).send({ message: err });
                return;
            }

            if (user) {
                res.status(400).send({ message: "Failed! Email is already in use!" });
                return;
            }

            next();
        });

};

checkRoleExisted = (req, res, next) => {
    if (req.body.role) {

            if (!roles.includes(req.body.role.toUpperCase())) {
                res.status(400).send({
                    message: `Failed! Role ${req.body.role} does not exist!`
                });
                return;
            }

    }

    next();
};

const verifySignUp = {
    checkDuplicateEmail,
    checkRoleExisted
};

module.exports = verifySignUp;
