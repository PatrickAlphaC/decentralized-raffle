/* eslint-disable node/no-unpublished-import */
import { HardhatRuntimeEnvironment } from "hardhat/types"
// eslint-disable-next-line node/no-missing-import
import { DeployFunction } from "hardhat-deploy/types"

const deployMocks: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { deployments, getNamedAccounts, getChainId } = hre
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = await getChainId()
  if (chainId === "31337") {
    log("Local network detected! Deploying mocks...")
    const linkToken = await deploy("LinkToken", {
      from: deployer,
      args: [],
      log: true,
    })
    await deploy("VRFCoordinatorMock", {
      from: deployer,
      log: true,
      args: [linkToken.address],
    })
    log("Mocks Deployed!")
    log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
    log(
      "You are deploying to a local network, you'll need a local network running to interact"
    )
    log(
      "Please run `npx hardhat console` to interact with the deployed smart contracts!"
    )
    log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
  }
}
export default deployMocks
deployMocks.tags = ["all", "mocks", "raffle"]
