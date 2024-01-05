var Product = require("../models/Product.model");
var User = require("../models/User.model");

//add product
exports.create = async (req, res) => {
  var list = req.files.map((file) => file.path);
  const p = new Product({
    name: req.body.name,
    description: req.body.description,
    category: req.body.category,
    price: req.body.price,
    auction_product: false,
    sold: false,
    like: 0,
    exchange: req.body.exchange,
    is_deleted: false,
    location: { larg: req.body.larg, long: req.body.long },
    seller: req.params.idU,
    shipped: false,
    picture: list,
    happy:0,
    sad:0,
    amazon_price:"",
    amazon_name:"",
    amazon_picture:""

  });
  try {
    const product = await p.save();
    User.findByIdAndUpdate(req.params.idU, {
      $inc: { activeProducts_count: 1 },
    })
      .then()
      .catch((err) => {
        res.status(500).send({ message: err.message });
      });
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

//get one product
exports.find = (req, res) => {
  Product.findById(req.params.id)
    .then((product) => {
      res.json(product);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

/*---get all products---*/
exports.find_products = (req, res) => {
  Product.find({ is_deleted: false, sold: false })
    .sort({ createdAt: -1 })
    .then((product) => {
      res.json(product);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

//update product
exports.update = (req, res) => {
  var list = req.files.map((file) => file.path);
  //console.log(list)

  const id = req.params.id;
  Product.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `Cannot Update product with ${id}. Maybe product not found!`,
        });
      } else {
        res.send("updated");
      }
    })
    .catch((err) => {
      res.status(500).send({ message: "Error Update product information" });
    });
};

//delete
exports.deleteProduct = (req, res) => {
  const id = req.params.id;
  Product.findById(id)
    .then((product) => {
      product.is_deleted = true;
      product.save();
      res.json(product);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

/*---get products by category ---*/
exports.find_products_category = (req, res) => {
  Product.find({ category: req.params.catg, is_deleted: false, sold: false })
    .sort({ createdAt: -1 })
    .then((product) => {
      res.json(product);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};
/* product is sold */
exports.soldProduct = async (req, res) => {
  const p = await Product.findByIdAndUpdate(req.params.id, { sold: true });
  User.findByIdAndUpdate(p.seller, {
    $inc: { activeProducts_count: -1, productsSold_count: 1 },
  })
    .then()
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
  res.json(p);
};
/* get products of user */
exports.getProductUser = async (req, res) => {
  const products = await Product.find({
    seller: req.params.idU,
    is_deleted: false,
  })
    .sort({ createdAt: -1 })
    .then()
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
  res.json(products);
};

/* get products of user not solded */
exports.getProductNotSold = async (req, res) => {
  const products = await Product.find({
    seller: req.params.idU,
    is_deleted: false,
    sold: false,
  })
    .sort({ createdAt: -1 })
    .then()
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
  res.json(products);
};

// add recent visited product
exports.addRecentProduct = async (req, res) => {
  var existe=false
  const user = await User.findById(req.params.idU);
  if (user.products) {
    for (let i = 0; i < user.products.length; i++) {
      if (user.products[i].product._id.equals(req.params.idP)) {
        existe=true;
        
      } else {existe=false;}
    }
    
  }
  
  if(!existe){
    
    user.products.push({ product: req.params.idP });
        try {
          await User.findByIdAndUpdate(req.params.idU, { $set : {products: user.products }});
        
        } catch (err) {
          res.status(500).send({ message: err.message });
        }

  }
  res.json(user);

   
};

/* get recent visited products of user*/
exports.getRecentVisitedProductsUser = async (req, res) => {
  const user = await User.findById(req.params.idU)
    .then()
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
    user.products.sort((x, y) => y.date - x.date);
  p=[]
  for (let i = 0; i < user.products.length; i++) {
   
    p.push(user.products[i].product._id)
  }
  const products=  Product.find({"_id" : {"$in":p}}).then((pr)=>{
    res.json(pr);
  })
  .catch((err) => {
    res.status(500).send({ message: err.message });
  });
  
};

/* wishlist */
exports.addToWishlist= async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.idU,{ $push: { wishlist: req.params.idP }}).then((user)=>{
    res.json(user);
  }).catch((err) => {
    res.status(500).send({ message: err.message });
  });
}
/* get products from wishlist of user*/
exports.getProductsWishlist= async (req, res) => {
  const user = await User.findById(req.params.idU)
  .then()
  .catch((err) => {
    res.status(500).send({ message: err.message });
  });
p=[]
if(user!=null){
for (let i = 0; i < user.wishlist.length; i++) {
 
  p.push(user.wishlist[i]._id)
}
const products=  Product.find({"_id" : {"$in":p}}).then((pr)=>{
  res.json(pr);
})
.catch((err) => {
  res.status(500).send({ message: err.message });
});
}
}
/* remove from wishlist of user*/
exports.removeProductFromWishlist= async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.idU,{ $pull: { wishlist: req.params.idP }}).then((user)=>{
    res.json(user);
  }).catch((err) => {
    res.status(500).send({ message: err.message });
  });
}

/* get count of one product in all whishlists */

exports.getCountProductWishlist= async (req, res) => {
  const nbr = await User.find({wishlist: { _id: req.params.idP }}).count()
  .catch((err) => {
    res.status(500).send({ message: err.message });
  });
  res.json(nbr);
}
/* get nbr of views */
exports.getNbrOfViews= async (req, res) => {
  const nbr = await User.find({products: { $elemMatch:{product: { _id: req.params.idP }}}}).count()
  .catch((err) => {
    res.status(500).send({ message: err.message });
  });
  res.json(nbr);
}
/* update emotion */
exports.updateEmotion = (req, res) => {
  const id = req.params.idP;
  Product.findById(id)
    .then((product) => {
      product.happy = req.body.happy;
      product.sad = req.body.sad;
      product.save();
      res.json(product);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

/* get products with no emotions */
exports.getProductWithnNoEmotion = async (req, res) => {
  const products = await Product.find({
    is_deleted: false,
    happy: 0,
    sad:0
  })
    .then()
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
  res.json(products);
};
/* get products with no amazon details */
exports.getProductAmazon = async (req, res) => {
  const products = await Product.find({
    is_deleted: false,
    amazon_price:"",
    amazon_name:"",
    amazon_picture:""
  })
    .then()
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
  res.json(products);
};
/* update amazon product */
exports.updateAmazonProduct = (req, res) => {
  const id = req.params.idP;
  Product.findById(id)
    .then((product) => {
      product.amazon_price=req.body.price,
      product.amazon_name=req.body.name[0],
      product.amazon_picture=req.body.picture
      product.save();
      res.json(product);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};