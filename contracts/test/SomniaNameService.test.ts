import { expect } from "chai";
import { ethers } from "hardhat";

describe("SomniaNameService", function () {
  let somniaNameService: any;
  let owner: any;
  let addr1: any;
  let addr2: any;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const SomniaNameService = await ethers.getContractFactory("SomniaNameService");
    somniaNameService = await SomniaNameService.deploy();
    await somniaNameService.waitForDeployment();
  });

  describe("registerName", function () {
    it("Should register a valid name", async function () {
      const name = "test.somnia";

      await expect(somniaNameService.connect(addr1).registerName(name))
        .to.emit(somniaNameService, "NameRegistered")
        .withArgs(name, addr1.address);

      const resolvedAddress = await somniaNameService.resolveName(name);
      expect(resolvedAddress).to.equal(addr1.address);
    });

    it("Should revert if name already exists", async function () {
      const name = "test.somnia";

      await somniaNameService.connect(addr1).registerName(name);

      await expect(
        somniaNameService.connect(addr2).registerName(name)
      ).to.be.revertedWithCustomError(somniaNameService, "NameAlreadyExists");
    });

    it("Should revert if name is invalid", async function () {
      const invalidName = "invalid";

      await expect(
        somniaNameService.connect(addr1).registerName(invalidName)
      ).to.be.revertedWithCustomError(somniaNameService, "InvalidName");
    });
  });

  describe("resolveName", function () {
    it("Should resolve a registered name", async function () {
      const name = "test.somnia";

      await somniaNameService.connect(addr1).registerName(name);
      const resolvedAddress = await somniaNameService.resolveName(name);

      expect(resolvedAddress).to.equal(addr1.address);
    });

    it("Should revert if name does not exist", async function () {
      const name = "nonexistent.somnia";

      await expect(
        somniaNameService.resolveName(name)
      ).to.be.revertedWithCustomError(somniaNameService, "NameNotFound");
    });
  });

  describe("transferName", function () {
    it("Should transfer name to new owner", async function () {
      const name = "test.somnia";

      await somniaNameService.connect(addr1).registerName(name);

      await expect(somniaNameService.connect(addr1).transferName(name, addr2.address))
        .to.emit(somniaNameService, "NameTransferred")
        .withArgs(name, addr1.address, addr2.address);

      const resolvedAddress = await somniaNameService.resolveName(name);
      expect(resolvedAddress).to.equal(addr2.address);
    });

    it("Should revert if not the owner", async function () {
      const name = "test.somnia";

      await somniaNameService.connect(addr1).registerName(name);

      await expect(
        somniaNameService.connect(addr2).transferName(name, addr2.address)
      ).to.be.revertedWithCustomError(somniaNameService, "NotOwner");
    });
  });

  describe("getOwnerNames", function () {
    it("Should return names owned by an address", async function () {
      const name1 = "test1.somnia";
      const name2 = "test2.somnia";

      await somniaNameService.connect(addr1).registerName(name1);
      await somniaNameService.connect(addr1).registerName(name2);

      const ownerNames = await somniaNameService.getOwnerNames(addr1.address);
      expect(ownerNames).to.include(name1);
      expect(ownerNames).to.include(name2);
    });
  });
});
