var Product = require('../models/Product.model');
var Review = require('../models/Review.model');

/* add review */
exports.create = async (req, res) => {
    const review = new Review({
        review: req.body.review,
        date: new Date(),
        is_deleted: false,
        client: req.params.idU,
        product: req.params.idP
    })
    try {
        const r = await review.save();
        res.status(201).json(r);
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
}

/* update review */
exports.update = async (req, res) => {
    Review.findOneAndUpdate({ client: req.params.idU, product: req.params.idP, is_deleted: false }, { review: req.body.review }).then(review => {
        res.json(review);
    }).catch(err => {
        res.status(500).send({ message: err.message })
    })
}

/* delete review */
exports.delete = async (req, res) => {
    Review.findOneAndUpdate({ client: req.params.idU, product: req.params.idP, is_deleted: false }, { is_deleted: true }).then(review => {
        res.json(review);
    }).catch(err => {
        res.status(500).send({ message: err.message })
    })
}
/* get review of one Product */
exports.find = async (req, res) => {
    Review.find({ product: req.params.idP, is_deleted: false }).then(review => {
        res.json(review)
    })
        .catch(err => {
            res.status(500).send({ message: err.message })
        })
}

/* get review of one Product/user */
exports.findPU = async (req, res) => {
    Review.find({ client: req.params.idU, product: req.params.idP, is_deleted: false }).then(review => {
        res.json(review)
    })
        .catch(err => {
            res.status(500).send({ message: err.message })
        })
}