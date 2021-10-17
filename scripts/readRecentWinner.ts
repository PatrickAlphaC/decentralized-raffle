// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat

import { ethers } from "hardhat"

// Runtime Environment's members available in the global scope.
const hre = require("hardhat")

async function main() {
    // Hardhat always runs the compile task when running scripts with its command
    // line interface.
    //
    // If this script is run directly using `node` you may want to call compile
    // manually to make sure everything is compiled
    // await hre.run('compile');

    // We get the contract to deploy
    const accounts = await hre.ethers.getSigners()
    const Raffle = await hre.ethers.getContractFactory("Raffle")
    // eslint-disable-next-line no-undef
    const raffle = new ethers.Contract(Raffle, Raffle.interface, accounts[0])
    const recentWinner = await raffle.s_recentWinner()
    console.log(recentWinner)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    // eslint-disable-next-line no-process-exit
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        // eslint-disable-next-line no-process-exit
        process.exit(1)
    })
