import { run } from "hardhat";

async function main() {
  // Verify VoucherRedemption contract
  console.log("Verifying VoucherRedemption contract...");
  try {
    await run("verify:verify", {
      address: process.env.VOUCHER_CONTRACT_ADDRESS,
      constructorArguments: [],
    });
    console.log("VoucherRedemption verified successfully");
  } catch (error) {
    console.log("VoucherRedemption verification failed:", error);
  }

  // Verify SomniaNameService contract
  console.log("Verifying SomniaNameService contract...");
  try {
    await run("verify:verify", {
      address: process.env.SNS_CONTRACT_ADDRESS,
      constructorArguments: [],
    });
    console.log("SomniaNameService verified successfully");
  } catch (error) {
    console.log("SomniaNameService verification failed:", error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
