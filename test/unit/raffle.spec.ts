import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
import { ethers, deployments, network, run, getChainId } from 'hardhat'
import { Deployment } from 'hardhat-deploy/dist/types'
import { Raffle } from '../../typechain'
const { developmentChains, networkConfig } = require('../../helper-hardhat-config')

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

describe('Raffle', function () {
  let runTest = false
  let raffle: Raffle, accounts: any[], LinkToken: Deployment, VRFCoordinatorMock: Deployment
  let player: SignerWithAddress, oracle: SignerWithAddress
  const randomNumber = 777
  beforeEach(async () => {
    if (developmentChains.includes(network.name)) {
      runTest = true
    }
    await deployments.fixture(['raffle'])
    const RaffleDeployment = await deployments.get('Raffle')
    LinkToken = await deployments.get('LinkToken')
    VRFCoordinatorMock = await deployments.get('VRFCoordinatorMock')
    accounts = await ethers.getSigners()
    player = accounts[0]
    oracle = accounts[1]
    raffle = await ethers.getContractAt('Raffle', RaffleDeployment.address, player)
  })
  it('should allow people to enter the raffle', async () => {
    if (runTest) {
      const entranceFee = await raffle.s_entranceFee()
      const enterTx = await raffle.enterRaffle({ value: entranceFee.toString() })
      const enterReceipt = await enterTx.wait()
      expect(enterReceipt.events![0].topics[1].replace('000000000000000000000000', '').toLowerCase()).to.equal(player.address.toLowerCase())
      expect(await raffle.s_players(0)).to.equal(player.address)
      await expect(raffle.enterRaffle({ value: '0' })).to.be.revertedWith('Not enough value sent to enter raffle')
    }
  })
  it('should kick off the random number request for a winner', async () => {
    if (runTest) {
      const entranceFee = await raffle.s_entranceFee()
      const enterTx = await raffle.enterRaffle({ value: entranceFee.toString() })
      await enterTx.wait()
      let upKeepResponse = await raffle.checkUpkeep('0x')
      expect(upKeepResponse[0]).to.equal(false)
      const chainId = await getChainId()
      const sleepTime = parseInt(networkConfig[chainId].interval) * 1000
      await sleep(sleepTime) // we need to wait out the interval!
      await run('fund-link', { contract: raffle.address, linkaddress: LinkToken.address }) // we do this also to move the blocks along
      upKeepResponse = await raffle.checkUpkeep('0x')
      expect(upKeepResponse[0]).to.equal(true)
      const performTx = await raffle.performUpkeep('0x')
      const performReceipt = await performTx.wait()
      // start to mock the chainlink vrf
      const startingAccountBalance = await raffle.provider.getBalance(player.address)
      const vrfCoordinatorMock = await ethers.getContractAt('VRFCoordinatorMock', VRFCoordinatorMock.address, oracle)
      await vrfCoordinatorMock.callBackWithRandomness(performReceipt.events![3].topics[1], randomNumber, raffle.address)
      expect(await raffle.s_recentWinner()).to.equal(player.address)
      const endingAccountBalance = await raffle.provider.getBalance(player.address)
      expect(startingAccountBalance.add(entranceFee)).to.equal(endingAccountBalance)
    }
  })
})

