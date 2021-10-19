/* eslint-disable no-process-exit */
import { /* run, */ ethers, deployments } from 'hardhat'

export async function getRecentWinner () {
  // await run('compile') only needed when deploying in a script
  const { get } = deployments
  const accounts = await ethers.getSigners()
  const Raffle = await ethers.getContractFactory('Raffle')
  const RaffleDeployment = await get('Raffle')
  const raffle = new ethers.Contract(RaffleDeployment.address, Raffle.interface, accounts[0])
  const recentWinner = await raffle.s_recentWinner()
  console.log(`The Recent Winner was ${recentWinner}`)
  return recentWinner
}

getRecentWinner()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
