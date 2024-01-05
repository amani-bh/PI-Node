const crypto = require("crypto");
const EC = require("elliptic").ec;
const ec = new EC("secp256k1");
const debug = require("debug")("techtak:blockchain");
const BlockchainModel = require("./../models/Blockchain.model");

async function isChainValid() {
  const realGenesis = await createGenesisBlock();
  const blocks = await BlockchainModel.find();

  for (let i = 1; i < blocks.length; i++) {
    const currentBlock = blocks[i];
    const previousBlock = blocks[i - 1];

    if (previousBlock.hash !== currentBlock.previousHash) {
      return false;
    }

    if (currentBlock.hash !== calculateHashBlock(currentBlock)) {
      return false;
    }
    if (!hasValidTransactions(currentBlock)) {
      return false;
    }
  }

  return true;
}

exports.addTransaction = async (req, res) => {
  const chainValid = await isChainValid();
  if (chainValid) {
    const transaction = {
      fromAddress: req.body.fromAddress,
      toAddress: req.body.toAddress,
      amount: req.body.amount,
      timestamp: Date.now(),
    };
    const privateKey = req.params.privateKey;
    const sign = signTransaction(privateKey, transaction);

    if (!sign) {
      res.status(404).send("You cannot sign transactions for other wallets!");
      return;
    }

    transaction.signature = sign;

    if (!transaction.fromAddress || !transaction.toAddress) {
      res.status(404).send("Transaction must include from and to address");
      return;
    }

    if (transaction.amount <= 0) {
      res.status(404).send("Transaction amount should be higher than 0");
      return;
    }

    // Making sure that the amount sent is not greater than existing balance
    const walletBalance = await getBalanceOfAddress(transaction.fromAddress);
    if (walletBalance < transaction.amount) {
      res.status(404).send("Not enough balance");
      return;
    }

    await minePendingTransactions(transaction);
    res.status(200).send("Transaction added");
  } else {
    res.status(200).send("chain not valid");
  }
};

exports.addTransactions = async (
  fromAddress,
  toAddress,
  amount,
  privateKey
) => {
  const chainValid = await isChainValid();
  if (chainValid) {
    const transaction = {
      fromAddress: fromAddress,
      toAddress: toAddress,
      amount: amount,
      timestamp: Date.now(),
    };
    const sign = signTransaction(privateKey, transaction);

    if (!sign) {
      return false;
    }

    transaction.signature = sign;

    if (!transaction.fromAddress || !transaction.toAddress) {
      return false;
    }

    if (transaction.amount <= 0) {
      return false;
    }

    // Making sure that the amount sent is not greater than existing balance
    const walletBalance = await getBalanceOfAddress(transaction.fromAddress);
    if (walletBalance < transaction.amount) {
      return false;
    }

    await minePendingTransactions(transaction);
    return true;
  } else {
    return false;
  }
};

exports.systemMine = async (req, res) => {
  const chainValid = await isChainValid();
  if (chainValid) {
    const transaction = {
      fromAddress: null,
      toAddress: req.body.toAddress,
      amount: req.body.amount,
      timestamp: Date.now(),
    };
    minePendingTransactions(transaction);
    res.status(200).send("Success");
  }
};
exports.systemMines = async (pub, amount) => {
  const chainValid = await isChainValid();
  if (chainValid) {
    const transaction = {
      fromAddress: null,
      toAddress: pub,
      amount: amount,
      timestamp: Date.now(),
    };
    minePendingTransactions(transaction);
    return true;
  }
  return false;
};

exports.getBalance = async (req, res) => {
  const address = req.params.address;
  const balance = await getBalanceOfAddress(address);

  res.status(200).send({ balance: balance });
};
exports.getBalances = async (publicKey) => {
  const balance = await getBalanceOfAddress(publicKey);

  return balance;
};
exports.getAllTransactionsForWallet = async (req, res) => {
  const txs = [];
  const address = req.params.address;
  const blocks = await BlockchainModel.find().sort({ timestamp: -1 });

  for (const block of blocks) {
    if (
      block.transaction.fromAddress === address ||
      block.transaction.toAddress === address
    ) {
      txs.push({ transaction: block.transaction, hash: block.hash });
    }
  }

  res.status(200).send(txs);
};
exports.getAllTransactions = async (req, res) => {
  const blocks = await BlockchainModel.find().sort({ timestamp: -1 });
  blocks.pop();

  res.status(200).send(blocks);
};

function calculateHashTransaction(transaction) {
  return crypto
    .createHash("sha256")
    .update(
      transaction.fromAddress +
        transaction.toAddress +
        transaction.amount +
        transaction.timestamp
    )
    .digest("hex");
}

function calculateHashBlock(block) {
  return crypto
    .createHash("sha256")
    .update(
      block.previousHash +
        block.timestamp +
        JSON.stringify(block.transaction) +
        block.nonce
    )
    .digest("hex");
}

function mineBlock(difficulty, block) {
  while (
    block.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")
  ) {
    block.nonce++;
    block.hash = calculateHashBlock(block);
  }

  debug(`Block mined: ${block.hash}`);
}

//create the first block
async function createGenesisBlock() {
  const block = {
    timestamp: Date.parse("2017-01-01"),
    previousHash: "0",
    nonce: 0,
  };
  block.hash = calculateHashBlock(block);

  let newBlock = new BlockchainModel(block);

  const blocks = await BlockchainModel.find();

  if (blocks.length == 0) {
    const blockSave = await newBlock.save(newBlock);
    return blockSave;
  } else return blocks[0];
}

async function getLatestBlock() {
  const blocks = await BlockchainModel.find();
  // res.status(200).send(blocks[blocks.length - 1]);
  // get from base
  return blocks[blocks.length - 1];
}

function signTransaction(signingKey, transaction) {
  const privateKey = ec.keyFromPrivate(signingKey);

  if (privateKey.getPublic("hex") !== transaction.fromAddress) {
    return null;
  }

  const hashTx = calculateHashTransaction(transaction);
  const sig = privateKey.sign(hashTx, "base64");

  return sig.toDER("hex");
}

async function minePendingTransactions(transaction) {
  const difficulty = 2;
  const lastBlock = await getLatestBlock();
  const block = {
    timestamp: Date.now(),
    transaction: transaction,
    previousHash: calculateHashBlock(lastBlock),
    nonce: 0,
  };
  const blocks = await BlockchainModel.find();
  if (blocks[0].timestamp == lastBlock.timestamp)
    block.previousHash = lastBlock.hash;

  block.hash = calculateHashBlock(block);
  console.log("block added now", block);

  mineBlock(difficulty, block);

  debug("Block successfully mined!");
  let newBlock = new BlockchainModel(block);
  newBlock.save(newBlock);

  this.pendingTransactions = [];
}

async function getBalanceOfAddress(address) {
  let balance = 0;
  console.log(address);
  const blocks = await BlockchainModel.find();

  for (const block of blocks) {
    if (block) {
      if (block.transaction.fromAddress === address) {
        balance -= block.transaction.amount;
      }

      if (block.transaction.toAddress === address) {
        balance += block.transaction.amount;
      }
    }
  }
  debug("getBalanceOfAdrees: %s", balance);
  return balance;
}

function isValid(transaction) {
  // If the transaction doesn't have a from address we assume it's a
  // mining reward and that it's valid. You could verify this in a
  // different way (special field for instance)
  if (transaction.fromAddress === null) return true;

  if (!transaction.signature || transaction.signature.length === 0) {
    throw new Error("No signature in this transaction");
  }

  const publicKey = ec.keyFromPublic(transaction.fromAddress, "hex");
  console.log("from address:" + transaction.fromAddress);

  return publicKey.verify(
    calculateHashTransaction(transaction),
    transaction.signature
  );
}

function hasValidTransactions(block) {
  if (!isValid(block.transaction)) {
    return false;
  }

  return true;
}
