import './styles/App.css';
import linkedinLogo from './assets/linkedin-logo.svg';
import React, { useEffect, useState } from "react";
import {ethers} from "ethers";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import CoinBase from "@coinbase/wallet-sdk";
import { InjectedConnector } from "@web3-react/injected-connector";


import abi from "./utils/MyEpicNFT.json";

// Constants
const LINNKEDIN_HANDLE = 'faizan-ahmad-606a4611b/';
const LINNKEDIN_LINK = `https://www.linkedin.com/in/${LINNKEDIN_HANDLE}`;
const OPENSEA_LINK = '';
const TOTAL_MINT_COUNT = 50;

const CONTRACT_ADDRESS = "0x80829301072efd18ACeC33122afEe74842c13fa2";
//Web3Modal
const providerOptions = {
  // InjectedConnector:{
  //   supportedChainIds: [1, 3, 4, 5, 42]  //Not working
  // },
  walletconnect: {
    package: WalletConnectProvider, // required
    options: {
      infuraId: "BKsAeeC-F7GB6KBzySe_p5aOCRQ1ZH9" // required
    }
  },
  binancechainwallet: {
    package: true
  },
  coinbasewallet: {
    package: CoinBase, // Required
    options: {
      appName: "My Epic NFT", // Required
      infuraId: "BKsAeeC-F7GB6KBzySe_p5aOCRQ1ZH9l", // Required
      rpc: "", // Optional if `infuraId` is provided; otherwise it's required
      chainId: 4, // Optional. It defaults to 1 if not provided
      darkMode: false // Optional. Use dark theme, defaults to false
    }
  }

};
const web3modal =new Web3Modal({
  network: "rinkeby", // optional
  cacheProvider: true, // optional
  disableInjectedProvider: false, //Optional! if true, it will remove metamask from options
  providerOptions // required, from above
});


const App = () => {
            /*
            * Just a state variable we use to store our user's public wallet. Don't forget to import useState.
            */
          const [currentAccount, setCurrentAccount] =useState("");
          const [provider, setProvider] = useState();
          const [library, setLibrary] = useState();
          const [chainId, setChainId] = useState();


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

            // if(!ethereum) {
            //   alert("Get Metamask!");
            //   return;
            // }
            const provider = await web3modal.connect();
            const library = new ethers.providers.Web3Provider(provider);
            setProvider(provider);
            setLibrary(library);

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

      // Same stuff again
      const provider = await web3modal.connect();
      const library = new ethers.providers.Web3Provider(provider);
      const signer   = library.getSigner();
      
      const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, abi.abi, signer);

      // THIS IS THE MAGIC SAUCE.
      // This will essentially "capture" our event when our contract throws it.
      // If you're familiar with webhooks, it's very similar to that!
      connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
        console.log(from, tokenId.toNumber())
        alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
      });

      console.log("Setup event listener!")

    
  } catch (error) {
    console.log(error)
  }
}




//Minting function......../////////
        const askContractToMintNft = async() =>{
          try{
            const { ethereum } = window;
            //web3Modal
            const provider = await web3modal.connect();
              const library = new ethers.providers.Web3Provider(provider);
              const signer   = library.getSigner();
              //connection with contract
              const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, abi.abi, signer);

              console.log("Going to pop wallet to pay Gas...");
              let nftTxn = await connectedContract.makeAnEpicNFT();
              console.log("Mining...Please wait.");
              await nftTxn.wait();
              console.log(nftTxn);
              console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
            
            
          } catch(error){
            console.log(error)
          }
        }

        //Remove Wallet
        const refreshState = () => {
          setCurrentAccount();
          setChainId();
          //setNetwork("");
          setProvider();
          //setSignature("");
          //setVerified(undefined);
        };
      
        const disconnect = async () => {
          await web3modal.clearCachedProvider();
          refreshState();
        };
  

        // useEffect(()=>{
        //   CheckIfWalletIsConnected();
        // },[])

        // useEffect(() => {
        //   if (web3modal.cachedProvider) {
        //     connectWallet();
        //   }
        // }, []);
        useEffect(() => {
          if (provider?.on) {
            const handleAccountsChanged = (accounts) => {
              console.log("accountsChanged", accounts);
              if (accounts) setCurrentAccount(accounts[0]);
            };
      
            const handleChainChanged = (_hexChainId) => {
              setChainId(_hexChainId);
            };
      
            const handleDisconnect = () => {
              console.log("disconnect");
              disconnect();
            };
      
            provider.on("accountsChanged", handleAccountsChanged);
            provider.on("chainChanged", handleChainChanged);
            provider.on("disconnect", handleDisconnect);
      
            return () => {
              if (provider.removeListener) {
                provider.removeListener("accountsChanged", handleAccountsChanged);
                provider.removeListener("chainChanged", handleChainChanged);
                provider.removeListener("disconnect", handleDisconnect);
              }
            };
          }
        }, [provider]);


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
        </div>,
               <button onClick={disconnect}>Disconnect</button>
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
