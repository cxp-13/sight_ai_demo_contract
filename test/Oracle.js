const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Oracle", function () {
  async function deployOracleFixture() {
    const PRICE_PER_REQUEST = ethers.parseEther("0.01");

    const [owner, otherAccount] = await ethers.getSigners();

    const oracle = await ethers.deployContract("Oracle", [PRICE_PER_REQUEST]);

    return { oracle, PRICE_PER_REQUEST, owner, otherAccount };
  }

  describe("Computation", function () {
    it("Should request computation and emit event", async function () {
      const { oracle, PRICE_PER_REQUEST, owner, otherAccount } =
        await loadFixture(deployOracleFixture);

      const numbers = [10, 5, 2];
      const logic = ethers.toUtf8Bytes("sample logic");

      let requestId;
      const computationRequestedPromise = new Promise((resolve, reject) => {
        oracle.once("ComputationRequested", (id, user) => {
          try {
            expect(user).to.equal(otherAccount.address);
            requestId = id;
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      });

      await oracle
        .connect(otherAccount)
        .compute(numbers, logic, { value: PRICE_PER_REQUEST });
      await computationRequestedPromise;

      let computation = await oracle.getComputationData(requestId);
      console.log("computation", computation);

      console.log("-----callback------");

      const result = 42n;
      await oracle.connect(owner).callback(requestId, result);
      computation = await oracle.getComputationData(requestId);
      console.log("computation after callback", computation);
    });
  });
});
