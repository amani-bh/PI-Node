//Declaration:
const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cors = require("cors");
const logger = require("morgan");
const port = process.env.PORT || 3000;
const connectDB = require("./database/connection");
const notifDel = require("./routes/notifDelivery.route");

const eventRouter = require("./routes/event.route");
const chatRouter = require("./routes/chat.route");
const messageRouter = require("./routes/message.route");
const followRouter = require("./routes/follow.route");
const order = require("./routes/Order.route");
const exchange = require("./routes/exchange.route");

// Cors
app.use(cors());
//Logger
app.use(logger("dev"));
//body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//dotenv
dotenv.config();
//Server Connection :
const server = require("http").createServer(app);

server.listen(port, () => {
  console.log("Server connected on port : %s", port);
});

app.use("/event", eventRouter);

//Routes:
const authRouter = require("./routes/auth.routes");
app.use("/auth", authRouter);
const userRouter = require("./routes/user.routes");
app.use("/user", userRouter);

app.use("/chat", chatRouter);
app.use("/message", messageRouter);
app.use("/follow", followRouter);
app.use("/product", require("./routes/product.route"));
app.use("/blockchain", require("./routes/blockchain.route"));

app.use("/card", require("./routes/card.route"));
app.use("/review", require("./routes/review.route"));
app.use("/order", order);
app.use("/exchange", exchange);

app.use("/notif/delivery", notifDel);

//Database Connection :
connectDB();
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});
let users = [];
let delivery = [];
// const bidDuration = 10;
// const startTime = process.hrtime();

const addUser = (userId, socketId) => {
  console.log(userId + " " + socketId);
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const addNotifDelivery = (userId, socketId) => {
  delivery.push({ userId, socketId });
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

var dataTracker = { long: 0, larg: 0 };
var status = "START";
var countdown = 30;
var WinnerCountdown = setInterval(function () {
  if (status == "IN_PROGRESS") {
    countdown--;
    io.sockets.emit("timer", { countdown: countdown });
    if (countdown === 0) {
      io.sockets.emit("timer", "Congratulations You WON!!");
      clearInterval(WinnerCountdown);
      status = "FINISHED";
    }
  }
}, 1000);

io.on("connection", (socket) => {
  const socketId = socket.id;
  //when ceonnect
  socket.on("JoinEvent", (eventStatus) => {
    status = eventStatus;
    io.sockets.emit("NewEvent", eventStatus);
  });
  socket.on("reset", function (data) {
    countdown = 30;
    io.sockets.emit("timer", { countdown: countdown });
  });
  //take userId and socketId from user
  socket.on("addUser", (userId) => {
    addUser(userId, socketId);
    io.emit("getUsers", users);
  });

  socket.on("addNotifDelivery", (userId) => {
    console.log(userId);
    addNotifDelivery(userId, socket.id);
  });
  //send and get message
  socket.on("sendBid", ({ bid, user }) => {
    io.emit("getBid", {
      bid,
      user,
    });
  });

  //send and get message
  socket.on(
    "sendMessage",
    ({ sender, receiver, content, sendedAt, like, removed, audio }) => {
      const user = getUser(receiver);

      io.to(user.socketId).emit("getMessage", {
        sender,
        receiver,
        content,
        sendedAt,
        like,
        removed,
        audio,
      });
    }
  );
  socket.on("sendWallet", (rec, ctn) => {
    
    io.emit("getWallet")
  });
  socket.on("deleteProd", (rec, ctn) => {
    delivery.map((data, i) => {
      if (rec == data.userId) {
        io.to(data.socketId).emit("deleteProd", { ctn });
      }
    });
  });
  socket.on("sendCart", (rec, ctn) => {
    console.log("ok");
    delivery.map((data, i) => {
      if (rec.includes(data.userId)) {
        io.to(data.socketId).emit("sendCart", {
          ctn,
        });
      }
    });
  });

  socket.on("sendTracker", (rec, ctn) => {
    delivery.map((data, i) => {
      if (rec.includes(data.userId)) {
        io.to(data.socketId).emit("getTracker", {
          ctn,
        });
      }
    });
  });

  socket.on("shippingProd", (req, content) => {
    console.log(" test " + req);

    delivery.map((data, i) => {
      if (data.userId == req) {
        io.to(data.socketId).emit("getShippingProd", { content });
      }
    });
  });
  socket.on("notificationDelivery", (receiver, content) => {
    delivery.map((data, i) => {
      if (receiver.includes(data.userId)) {
        io.to(data.socketId).emit("getNotifDelivery", {
          content,
        });
      }
    });
  });

  const removeUser = (socketId) => {
    users = users.filter((user) => user.socketId !== socketId);
  };

  //when disconnect
  socket.on("disconnect", () => {
    console.log("a user disconnected!");
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
  socket.on("callUser", ({ userToCall, signalData, from, name }) => {
    io.to(userToCall).emit("callUser", { signal: signalData, from, name });
  });

  socket.on("answerCall", (data) => {
    io.to(data.to).emit("callAccepted", data.signal);
  });

  socket.on("hangUpCall", ({ userToCall, from }) => {
    io.to(userToCall).emit("callEnded", {
      userToCall,
      from,
    });
  });

  socket.on("likeMessage", ({ user, messageId, value }) => {
    io.to(user).emit("likeMessage", {
      messageId,
      value,
    });
  });

  socket.on("removeMessage", ({ user, messageId }) => {
    io.to(user).emit("removeMessage", {
      messageId,
    });
  });

  socket.on("seenConversation", ({ user, chat }) => {
    io.to(user).emit("seenConversation", {
      chat,
    });
  });
});

