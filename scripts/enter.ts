/* eslint-disable no-process-exit */
import { /* run, */ ethers, deployments } from 'hardhat'

export async function enterRaffle () {
  // await run('compile') only needed when deploying in a script
  const { get } = deployments

  const accounts = await ethers.getSigners()

  const Raffle = await ethers.getContractFactory('Raffle')
  const RaffleDeployment = await get('Raffle')
  // // eslint-disable-next-line no-undef
  const raffle = new ethers.Contract(RaffleDeployment.address, Raffle.interface, accounts[0])
  const entranceFee = await raffle.s_entranceFee()
  const enterTx = await raffle.enterRaffle({ value: entranceFee.toString() })
  await enterTx.wait()
  console.log('Entered!')
  return enterTx
}

enterRaffle()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
