import { expect } from "chai";
import { ethers } from "hardhat";

describe("VoucherRedemption", function () {
  let voucherRedemption: any;
  let owner: any;
  let addr1: any;
  let addr2: any;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const VoucherRedemption = await ethers.getContractFactory("VoucherRedemption");
    voucherRedemption = await VoucherRedemption.deploy();
    await voucherRedemption.waitForDeployment();
  });

  describe("createVoucher", function () {
    it("Should create a voucher with correct amount", async function () {
      const voucherId = ethers.keccak256(ethers.toUtf8Bytes("test-voucher"));
      const amount = ethers.parseEther("1.0");

      await expect(voucherRedemption.connect(addr1).createVoucher(voucherId, { value: amount }))
        .to.emit(voucherRedemption, "VoucherCreated")
        .withArgs(voucherId, amount, addr1.address);

      const voucherAmount = await voucherRedemption.getVoucherAmount(voucherId);
      expect(voucherAmount).to.equal(amount);
    });

    it("Should revert if voucher already exists", async function () {
      const voucherId = ethers.keccak256(ethers.toUtf8Bytes("test-voucher"));
      const amount = ethers.parseEther("1.0");

      await voucherRedemption.connect(addr1).createVoucher(voucherId, { value: amount });

      await expect(
        voucherRedemption.connect(addr2).createVoucher(voucherId, { value: amount })
      ).to.be.revertedWithCustomError(voucherRedemption, "VoucherAlreadyExists");
    });

    it("Should revert if amount is zero", async function () {
      const voucherId = ethers.keccak256(ethers.toUtf8Bytes("test-voucher"));

      await expect(
        voucherRedemption.connect(addr1).createVoucher(voucherId, { value: 0 })
      ).to.be.revertedWithCustomError(voucherRedemption, "InsufficientFunds");
    });
  });

  describe("redeemVoucher", function () {
    it("Should redeem a voucher successfully", async function () {
      const voucherId = ethers.keccak256(ethers.toUtf8Bytes("test-voucher"));
      const amount = ethers.parseEther("1.0");

      await voucherRedemption.connect(addr1).createVoucher(voucherId, { value: amount });

      const initialBalance = await ethers.provider.getBalance(addr2.address);

      await expect(voucherRedemption.connect(addr2).redeemVoucher(voucherId))
        .to.emit(voucherRedemption, "VoucherRedeemed")
        .withArgs(voucherId, amount, addr2.address);

      const finalBalance = await ethers.provider.getBalance(addr2.address);
      expect(finalBalance).to.be.gt(initialBalance);
    });

    it("Should revert if voucher does not exist", async function () {
      const voucherId = ethers.keccak256(ethers.toUtf8Bytes("non-existent"));

      await expect(
        voucherRedemption.connect(addr2).redeemVoucher(voucherId)
      ).to.be.revertedWithCustomError(voucherRedemption, "VoucherNotFound");
    });

    it("Should revert if voucher already redeemed", async function () {
      const voucherId = ethers.keccak256(ethers.toUtf8Bytes("test-voucher"));
      const amount = ethers.parseEther("1.0");

      await voucherRedemption.connect(addr1).createVoucher(voucherId, { value: amount });
      await voucherRedemption.connect(addr2).redeemVoucher(voucherId);

      await expect(
        voucherRedemption.connect(addr2).redeemVoucher(voucherId)
      ).to.be.revertedWithCustomError(voucherRedemption, "VoucherAlreadyRedeemed");
    });
  });
});
