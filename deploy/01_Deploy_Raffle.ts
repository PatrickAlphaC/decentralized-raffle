/* eslint-disable node/no-unpublished-import */
import { HardhatRuntimeEnvironment } from "hardhat/types";
// eslint-disable-next-line node/no-missing-import
import { DeployFunction } from "hardhat-deploy/types";
import { Deployment } from "hardhat-deploy/dist/types";
// import { networkConfig } from "../helper-hardhat-config"

interface networkConfigItem {
  name: string;
  chainlinkFee: string;
  entranceFee: string;
  keyHash: string;
  fundAmount: string;
  interval: string;
  linkToken?: string;
  vrfCoordinator?: string;
}

interface networkConfigInfo {
  [key: string]: networkConfigItem;
}

export const networkConfig: networkConfigInfo = {
  default: {
    name: "hardhat",
    chainlinkFee: "100000000000000000",
    entranceFee: "100000000000000000",
    keyHash:
      "0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4",
    fundAmount: "1000000000000000000",
    interval: "60",
  },
  "31337": {
    name: "localhost",
    chainlinkFee: "100000000000000000",
    entranceFee: "100000000000000000",
    keyHash:
      "0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4",
    fundAmount: "1000000000000000000",
    interval: "60",
  },
  "42": {
    name: "kovan",
    linkToken: "0xa36085F69e2889c224210F603D836748e7dC0088",
    keyHash:
      "0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4",
    vrfCoordinator: "0xdD3782915140c8f3b190B5D67eAc6dc5760C46E9",
    chainlinkFee: "100000000000000000",
    entranceFee: "100000000000000000",
    fundAmount: "1000000000000000000",
    interval: "60",
  },
};

const deployRaffle: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { deployments, getNamedAccounts, getChainId } = hre;
  const { deploy, log, get } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();
  let linkTokenAddress: string,
    vrfCoordinatorAddress: string,
    linkToken: Deployment,
    VRFCoordinatorMock: Deployment;
  let additionalMessage = "";

  if (chainId === "31337") {
    linkToken = await get("LinkToken");
    VRFCoordinatorMock = await get("VRFCoordinatorMock");
    linkTokenAddress = linkToken.address;
    vrfCoordinatorAddress = VRFCoordinatorMock.address;
    additionalMessage = " --linkaddress " + linkTokenAddress;
  } else {
    linkTokenAddress = networkConfig[chainId].linkToken!;
    vrfCoordinatorAddress = networkConfig[chainId].vrfCoordinator!;
  }
  const keyHash: string = networkConfig[chainId].keyHash;
  const chainlinkFee: string = networkConfig[chainId].chainlinkFee;
  const entranceFee: string = networkConfig[chainId].entranceFee;
  const interval: string = networkConfig[chainId].interval;

  const raffle = await deploy("Raffle", {
    from: deployer,
    args: [
      vrfCoordinatorAddress,
      linkTokenAddress,
      keyHash,
      chainlinkFee,
      entranceFee,
      interval,
    ],
    log: true,
  });
  const networkWorkName: string = networkConfig[chainId].name;

  log("Run the following command to fund contract with LINK:");
  log(
    "npx hardhat fund-link --contract " +
      raffle.address +
      " --network " +
      networkWorkName +
      additionalMessage
  );
};
export default deployRaffle;
deployRaffle.tags = ["all", "mocks", "raffle"];
