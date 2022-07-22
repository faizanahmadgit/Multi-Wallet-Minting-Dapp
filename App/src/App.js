import './styles/App.css';
import linkedinLogo from './assets/linkedin-logo.svg';
import React, { useEffect, useState } from "react";
import {ethers} from "ethers";

import abi from "./utils/MyEpicNFT.json";

// Constants
const LINNKEDIN_HANDLE = 'faizan-ahmad-606a4611b/';
const LINNKEDIN_LINK = `https://www.linkedin.com/in/${LINNKEDIN_HANDLE}`;
const OPENSEA_LINK = '';
const TOTAL_MINT_COUNT = 50;

const CONTRACT_ADDRESS = "0x80829301072efd18ACeC33122afEe74842c13fa2"

const App = () => {
            /*
            * Just a state variable we use to store our user's public wallet. Don't forget to import useState.
            */
          const [currentAccount, setCurrentAccount] =useState("");

        const CheckIfWalletIsConnected = async() => {
            const { ethereum } = window;
            if(!ethereum) {
              console.log("Make sure you have Metamask!");
              return;
            }else {
              console.log("we have the ethereum object!", ethereum);
            }
            
            const accounts = await ethereum.request({ method: "eth_accounts"});
            if(accounts.length != 0){
              const account = accounts[0];
              console.log("Found an authorized account: ", account);
              setCurrentAccount(account);

              // Setup listener! This is for the case where a user comes to our site
      // and connected their wallet for the first time.
      setupEventListener() 

            }else {
              console.log("No authorized account found!");
            }
        }

        const connectWallet = async () => {
          try{

            const { ethereum } = window;

            if(!ethereum) {
              alert("Get Metamask!");
              return;
            }

            const accounts = await ethereum.request({ method: "eth_requestAccounts" });
            console.log("Connected ", accounts[0]);
            setCurrentAccount(accounts[0]);

            // Setup listener! This is for the case where a user comes to our site
      // and connected their wallet for the first time.
      setupEventListener() 

          }
          catch(error){
            console.log(error);
          }
        }
// Setup our listener.
const setupEventListener = async () => {
  // Most of this looks the same as our function askContractToMintNft
  try {
    const { ethereum } = window;

    if (ethereum) {
      // Same stuff again
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, abi.abi, signer);

      // THIS IS THE MAGIC SAUCE.
      // This will essentially "capture" our event when our contract throws it.
      // If you're familiar with webhooks, it's very similar to that!
      connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
        console.log(from, tokenId.toNumber())
        alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
      });

      console.log("Setup event listener!")

    } else {
      console.log("Ethereum object doesn't exist!");
    }
  } catch (error) {
    console.log(error)
  }
}




//Minting function......../////////
        const askContractToMintNft = async() =>{
          try{
            const { ethereum } = window;
            if(ethereum){
              const provider = new ethers.providers.Web3Provider(ethereum);
              const signer   = provider.getSigner();
              //connection with contract
              const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, abi.abi, signer);

              console.log("Going to pop wallet to pay Gas...");
              let nftTxn = await connectedContract.makeAnEpicNFT();
              console.log("Mining...Please wait.");
              await nftTxn.wait();
              console.log(nftTxn);
              console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
            }
            else {
              console.log("Ethereum object doesn't exist!");
            }
          } catch(error){
            console.log(error)
          }
        }
  

        useEffect(()=>{
          CheckIfWalletIsConnected();
        },[])


  // Render Methods
  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  const renderMintUI = () => (
    <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
      Mint NFT
    </button>
  )

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          {currentAccount === "" ? renderNotConnectedContainer() : renderMintUI()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={linkedinLogo} />
          <a
            className="footer-text"
            href={LINNKEDIN_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${LINNKEDIN_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
