const model = require ('../models/notifDelivery.model')

const getMessage=(req,res)=>{


    model.find((err,data)=>{
    if (err)
    res.json(err);
    else
    {
        res.json(data.filter(d=>d.id_LIV==req.params.id));

    }
})

}


const postMessage=(req,res)=>{

new model({
    ref:req.body.ref,
    message:req.body.message,
    date:new Date(),
    id_LIV:req.body.id_LIV
}).save();
res.json("sucess")
}


const deleteMessage=(req,res)=>{

    model.findByIdAndRemove(req.params.id,(err,data)=>{
        if(err)
        res.json(err);
        else
        res.json('deleted with success')
    })

}

modifMessage=(req,res)=>{
model.findByIdAndUpdate(req.params.id,{_id:req.params.id,lu:true}).then(res.end('ok'))

}
module.exports={
    modifMessage,
    deleteMessage,
    postMessage,
    getMessage
}
