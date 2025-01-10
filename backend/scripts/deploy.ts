import { ethers } from "hardhat";

async function main() {
  const OptionsTrading = await ethers.getContractFactory("OptionsTrading");
  const optionsTrading = await OptionsTrading.deploy();
  await optionsTrading.waitForDeployment();

  console.log("OptionsTrading deployed to:", await optionsTrading.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 