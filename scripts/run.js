const main = async () => {
    const nftContractFactory = await hre.ethers.getContractFactory('MyEpicNFT');
    const nftContract = await nftContractFactory.deploy();
    await nftContract.deployed();
    console.log("Contract deployed to:", nftContract.address);
    //Call the Function
     const tx1 = await nftContract.makeAnEpicNFT();
     await tx1.wait();
     
     console.log("Minted NFT 1...");
     //2nd NFT
     
     const tx2 = await nftContract.makeAnEpicNFT();
     await tx2.wait();

     console.log("Minted NFT 2 ...");
     
 };
  
  const runMain = async () => {
    try {
      await main();
      process.exit(0);
    } catch (error) {
      console.log(error);
      process.exit(1);
    }
  };
  
  runMain();