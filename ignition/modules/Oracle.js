const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const { ethers } = require("hardhat");


module.exports = buildModule("OracleModule", (m) => {
  const PRICE_PER_REQUEST = ethers.parseEther("0.01");
  const oracle = m.contract("Oracle", [PRICE_PER_REQUEST]);
  return { oracle };
});
