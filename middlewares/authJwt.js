const jwt = require("jsonwebtoken");
const jwtConfig = require("../config/auth.config.js");

const  user = require('../models/User.model');
const roles = ["SUPER_ADMIN", "ADMIN", "CLIENT","SUBSCRIBER","DELIVERY_MAN"];

const { TokenExpiredError } = jwt;

const catchError = (err, res) => {
    if (err instanceof TokenExpiredError) {
        return res.status(401).send({ message: "Unauthorized! Access Token was expired!" });
    }

    return res.sendStatus(401).send({ message: "Unauthorized!" });
}

verifyToken = (req, res, next) => {
    let token = req.headers["x-access-token"];

    if (!token) {
        return res.status(403).send({ message: "No token provided!" });
    }

    jwt.verify(token, jwtConfig.secret, (err, decoded) => {
        if (err) {
            return catchError(err, res);
        }
        req.userId = decoded.id;
//       console.log(decoded.id);
        next();
    });
};

isSuperAdmin= (req,res,next) =>{
    user.findById(req.userId).exec((err,userf)=>{
       if(err){
           res.status(500).send({message:err});
           return;
       }
       if(userf.role==="SUPER_ADMIN"){
           next();
           return;
       }
       res.status(403).send({message:"Require Super Admin Role !"});
       return;
    });
};

isAdmin= (req,res,next) =>{
    user.findById(req.userId).exec((err,userf)=>{
        if(err){
            res.status(500).send({message:err});
            return;
        }
        if(userf.role==="ADMIN"){
            next();
            return;
        }
        res.status(403).send({message:"Require Admin Role !"});
        return;
    });
};

isDeliveryMan= (req,res,next) =>{
    user.findById(req.userId).exec((err,userf)=>{
        if(err){
            res.status(500).send({message:err});
            return;
        }
        if(userf.role==="DELIVERY_MAN"){
            next();
            return;
        }
        res.status(403).send({message:"Require DELIVERY_MAN Role !"});
        return;
    });
};

isSubscriber= (req,res,next) =>{
    user.findById(req.userId).exec((err,userf)=>{
        if(err){
            res.status(500).send({message:err});
            return;
        }
        if(userf.role==="SUBSCRIBER"){
            next();
            return;
        }
        res.status(403).send({message:"Require SUBSCRIBER Role !"});
        return;
    });
};

isClient= (req,res,next) =>{
    user.findById(req.userId).exec((err,userf)=>{
        if(err){
            res.status(500).send({message:err});
            return;
        }
        if(userf.role==="CLIENT"){
            next();
            return;
        }
        res.status(403).send({message:"Require CLIENT Role !"});
        return;
    });
};

isSuperAdminOrAdmin= (req,res,next) =>{
    user.findById(req.userId).exec((err,userf)=>{
        if(err){
            res.status(500).send({message:err});
            return;
        }
        if(userf.role==="SUPER_ADMIN" || userf.role==="ADMIN"){
            next();
            return;
        }
        res.status(403).send({message:"Require CLIENT Role !"});
        return;
    });
};



const authJwt = {
    verifyToken,
    isSuperAdmin,
    isAdmin,
    isDeliveryMan,
    isSubscriber,
    isClient,
    isSuperAdminOrAdmin
};
module.exports = authJwt;
