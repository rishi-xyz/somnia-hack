import { ethers } from "hardhat";

async function main() {
  console.log("Deploying contracts to Somnia network...");

  // Get the contract factories
  const VoucherRedemption = await ethers.getContractFactory("VoucherRedemption");
  const SomniaNameService = await ethers.getContractFactory("SomniaNameService");

  // Deploy VoucherRedemption contract
  console.log("Deploying VoucherRedemption contract...");
  const voucherRedemption = await VoucherRedemption.deploy();
  await voucherRedemption.waitForDeployment();
  const voucherAddress = await voucherRedemption.getAddress();
  console.log("VoucherRedemption deployed to:", voucherAddress);

  // Deploy SomniaNameService contract
  console.log("Deploying SomniaNameService contract...");
  const somniaNameService = await SomniaNameService.deploy();
  await somniaNameService.waitForDeployment();
  const nameServiceAddress = await somniaNameService.getAddress();
  console.log("SomniaNameService deployed to:", nameServiceAddress);

  console.log("\n=== Deployment Summary ===");
  console.log("VoucherRedemption:", voucherAddress);
  console.log("SomniaNameService:", nameServiceAddress);
  console.log("\nAdd these addresses to your .env file:");
  console.log(`NEXT_PUBLIC_VOUCHER_CONTRACT_ADDRESS=${voucherAddress}`);
  console.log(`NEXT_PUBLIC_SNS_CONTRACT_ADDRESS=${nameServiceAddress}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
