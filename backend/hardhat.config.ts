import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.19",
  networks: {
    hardhat: {
      chainId: 31337
    },
  },
  paths: {
    artifacts: "../frontend/src/contracts",
  },
};

export default config;
