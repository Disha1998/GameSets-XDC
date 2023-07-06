const hre = require("hardhat");

async function main() {

  const Gamesets = await hre.ethers.getContractFactory("GameSets");
  const gamesets = await Gamesets.deploy("supercool", "SC");

  await gamesets.deployed();

  console.log('deploy SuperCool contract to', gamesets.address);

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
