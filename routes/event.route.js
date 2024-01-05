const router = require("express").Router();
const controller =require("../controllers/event.controller");
const parser = require("../middlewares/cloudinary.config");

    //Crud
    router.post('/add',parser.single("picture"),controller.createEvent);
    router.put('/update/:idEvent',controller.updateEvent);
    router.delete('/delete/:idEvent',controller.deleteEvent);
    router.get('/allevents',controller.AllEvents);
    router.get('/alleventsBackOffice',controller.All);
    router.get('/allFinished',controller.AllEventsFinished);
    router.get('/:id',controller.findEvent);
    router.get('/eventBackOffice/:id',controller.findEventBackOffice);

    //Bids
    router.put('/addBid/:idEvent',controller.NextBids);
    router.put('/joinEvent/:idUser/:idEvent',controller.JoinEvent);
    router.put('/endEvent/:idEvent',controller.EndEvent);



module.exports = router;
