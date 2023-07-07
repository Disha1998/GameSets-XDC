

require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();
// require("dotenv").config({ path: "./.env" });

 

module.exports = {
  solidity: "0.8.16",
  networks: {
    apothem: {
      url: process.env.NEXT_PUBLIC_APOTHEM_NETWORK_URL,
      accounts: [process.env.NEXT_PUBLIC_PRIVATE_KEY]
    },
    testnet: {
      url: `https://babel-api.testnet.iotex.io`,
      accounts: [`${process.env.NEXT_PUBLIC_IOTEX_PRIVATE_KEY}`],
    },
  }
};


