let activeInput;
let loaded = false;

const contractAddress = '0x8bDae38faB3403354535020A8971AF695E6DD099';
const abi = [{"type":"constructor","stateMutability":"nonpayable","inputs":[]},{"type":"event","name":"MessageEdit","inputs":[{"type":"uint256","name":"messageNounce","internalType":"uint256","indexed":false},{"type":"address","name":"owner","internalType":"address","indexed":true},{"type":"uint256","name":"ownerNounce","internalType":"uint256","indexed":false},{"type":"uint256","name":"timestamp","internalType":"uint256","indexed":false},{"type":"uint256","name":"lastTempChange","internalType":"uint256","indexed":false},{"type":"uint256","name":"x","internalType":"uint256","indexed":false},{"type":"uint256","name":"y","internalType":"uint256","indexed":false},{"type":"bytes16","name":"temperature","internalType":"bytes16","indexed":false},{"type":"string","name":"payload","internalType":"string","indexed":false},{"type":"string","name":"url","internalType":"string","indexed":true}],"anonymous":false},{"type":"event","name":"MessageSent","inputs":[{"type":"uint256","name":"messageNounce","internalType":"uint256","indexed":false},{"type":"address","name":"owner","internalType":"address","indexed":true},{"type":"uint256","name":"ownerNounce","internalType":"uint256","indexed":false},{"type":"uint256","name":"timestamp","internalType":"uint256","indexed":false},{"type":"uint256","name":"lastTempChange","internalType":"uint256","indexed":false},{"type":"uint256","name":"x","internalType":"uint256","indexed":false},{"type":"uint256","name":"y","internalType":"uint256","indexed":false},{"type":"bytes16","name":"temperature","internalType":"bytes16","indexed":false},{"type":"string","name":"payload","internalType":"string","indexed":false},{"type":"string","name":"url","internalType":"string","indexed":true}],"anonymous":false},{"type":"fallback","stateMutability":"payable"},{"type":"function","stateMutability":"view","outputs":[{"type":"uint256","name":"","internalType":"uint256"}],"name":"DEBUG_TIME","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"address","name":"","internalType":"address payable"}],"name":"OWNER","inputs":[]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"destroy","inputs":[]},{"type":"function","stateMutability":"payable","outputs":[],"name":"downVote","inputs":[{"type":"uint256","name":"messageId","internalType":"uint256"}]},{"type":"function","stateMutability":"payable","outputs":[],"name":"edit","inputs":[{"type":"string","name":"payload","internalType":"string"},{"type":"uint256","name":"messageId","internalType":"uint256"}]},{"type":"function","stateMutability":"view","outputs":[{"type":"uint256","name":"","internalType":"uint256"}],"name":"messageNounce","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"address","name":"owner","internalType":"address"},{"type":"uint256","name":"ownerNounce","internalType":"uint256"},{"type":"uint256","name":"timestamp","internalType":"uint256"},{"type":"uint256","name":"lastTempChange","internalType":"uint256"},{"type":"uint256","name":"x","internalType":"uint256"},{"type":"uint256","name":"y","internalType":"uint256"},{"type":"bytes16","name":"temperature","internalType":"bytes16"},{"type":"string","name":"payload","internalType":"string"},{"type":"string","name":"url","internalType":"string"}],"name":"messages","inputs":[{"type":"uint256","name":"","internalType":"uint256"}]},{"type":"function","stateMutability":"view","outputs":[{"type":"uint256","name":"","internalType":"uint256"}],"name":"ownerNounces","inputs":[{"type":"address","name":"","internalType":"address"}]},{"type":"function","stateMutability":"payable","outputs":[],"name":"post","inputs":[{"type":"string","name":"payload","internalType":"string"},{"type":"string","name":"url","internalType":"string"},{"type":"uint256","name":"x","internalType":"uint256"},{"type":"uint256","name":"y","internalType":"uint256"}]},{"type":"function","stateMutability":"payable","outputs":[],"name":"upVote","inputs":[{"type":"uint256","name":"messageId","internalType":"uint256"}]},{"type":"receive","stateMutability":"payable"}];
let provider;
let network;
let signer;
let contract;

function displayableHex(a) {
  let str = `${a}`;
  return `${str.substring(0, 4)}...${str.slice(-4)}`;
}

// // initialize [signer]
// async function getSignerAccount2CH3() {
//   console.log(`provider === ${provider}`);
//   if (provider === undefined) {
//     const success = await connectToMetamaskRPC();
//     console.log(`connectToMetamaskRPC() => ${success}`);
//     if (!success) return false;
//   }
//   // Prompt user for account connections
//   try {
//     await provider.send("eth_requestAccounts", []);
//     signer = provider.getSigner();
//     const acc = await signer.getAddress();
//     console.log(`Connected to Account: ${acc}`);
//   } catch (error) {
//     console.log(error);
//     return false;
//   }
//   return true;
// }

// // await ((await new ethers.providers.Web3Provider(window.ethereum, "any")).send("eth_requestAccounts", []));

// // initialize [window.ethereum, provider, network]
// async function connectToMetamaskRPC() {
//   // enable metamask
//   // BUG: access window.ethereum
//   // BUG: https://gist.github.com/devjin0617/3e8d72d94c1b9e69690717a219644c7a
//   if (window.ethereum === undefined) return false;
//   // await window.ethereum.enable();
//   provider = new ethers.providers.Web3Provider(window.ethereum, "any");
//   console.log(`...Connecting...`);

//   // get network id
//   // network = await provider.getNetwork();
//   // const chainId = network.chainId;
//   // const chainName = network.name;
//   // console.log(`You are using chain: ${chainName}(${chainId})`)

//   // // switch network if wrong network
//   // if (chainId != 100) { // gnosis chain
//   //   try {
//   //     await window.ethereum.request({
//   //       method: "wallet_addEthereumChain",
//   //       params: [{
//   //         chainId: "0x64",
//   //         rpcUrls: ["https://rpc.gnosischain.com/"],
//   //         chainName: "Gnosis Chain",
//   //         nativeCurrency: {
//   //           name: "xDai",
//   //           symbol: "xDai",
//   //           decimals: 18
//   //         },
//   //         blockExplorerUrls: ["https://blockscout.com/xdai/mainnet/"]
//   //       }]
//   //     });
//   //   } catch (error) {
//   //     console.log(error);
//   //     return false;
//   //   }
//   // }
//   return true;
// }

// async function getMessages() {
//   if (provider === undefined) {
//     const success = await connectToMetamaskRPC();
//     if (!success) return false;
//   }
//   const contract = new ethers.Contract(contractAddress, abi, provider);
//   try {
//     const transaction = await contract.messages();
//     console.log(transaction);
//   } catch (error) {
//     console.log(error);
//     return false;
//   }
//   console.log("Success");
//   return true;
// }

// async function postMessage(message, url, x, y) {
//   if (signer === undefined) {
//     const success = await getSignerAccount2CH3();
//     if (!success) return false;
//   }
//   const contract = new ethers.Contract(contractAddress, abi, signer);
//   try {
//     const transaction = await contract.post(message, url, x, y);
//     console.log(transaction);
//     await transaction.wait();
//   } catch (error) {
//     if (error.code === 4001) {
//       console.log("User denied signature");
//     } else {
//       console.log(error);
//     }
//     return false;
//   }
//   console.log("Success");
//   return true;
// }

// function addComment(x, y, value) {
//   let comment = document.createElement("p");
//   comment.style = `font-family: monospace; margin: 0; padding: 0; border: none; position:absolute; top: ${y}px; left: ${x}px; background-color: #00000000; outline-width: 0; -webkit-box-shadow: none; -moz-box-shadow: none; box-shadow: none; width: ${document.body.scrollWidth - x}px; max-height: ${document.body.scrollHeight - y}px; word-break: break-all; overflow: hidden;`;
//   comment.innerText = value;
//   document.getElementById("comments").appendChild(comment);
// }

function onClick(event) {
  console.log("Click Event Registered");
  // BUG: doesn't sync with extension
  if (!window.CH3_ENABLED) return;
  console.log("Click Pass Through");

  // remove unsaved text
  if (activeInput !== undefined) {
    activeInput.remove();
    activeInput = undefined;
    console.log("Removed Active Input");
    return;
  }

  const x = event.pageX;
  const y = event.pageY;
  // size of seen current window
  const borderX = document.getElementsByTagName('body')[0] ? document.getElementsByTagName('body')[0].clientWidth : window.innerWidth;
  const borderY = document.getElementsByTagName('body')[0] ? document.getElementsByTagName('body')[0].clientWidth : window.innerHeight;

  let input = document.createElement("textarea");
  input.type = "text";
  // Alternative way to make exact input textbox: https://css-tricks.com/the-cleanest-trick-for-autogrowing-textareas/
  // Removing style: https://stackoverflow.com/questions/17109702/remove-all-stylings-border-glow-from-textarea
  // Width: https://stackoverflow.com/questions/3437786/get-the-size-of-the-screen-current-web-page-and-browser-window

  // overflow: hidden (so that texts outside of edge of window don't let the window scroll)
  // word-break: break-all (so word wrap will break into letters)
  // width: ${borderX - x}px (so textbox is from cursor to the edge of right hand side)
  // resize: none (so you can't resize input box)
  input.style = `font-family: monospace; margin: 0; padding: 0; border: none; position:absolute; top: ${y}px; left: ${x}px; background-color: #00000000; outline-width: 0; -webkit-box-shadow: none; -moz-box-shadow: none; box-shadow: none; width: ${document.body.scrollWidth - x}px; max-height: ${document.body.scrollHeight - y}px; word-break: break-all; overflow: hidden; resize: none;`;
  input.rows = 1; // textarea
  // auto height
  input.addEventListener('input', (event) => {
    event.target.style.height = (event.target.scrollHeight) + "px";
  });
  // send request
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      if (window.event.shiftKey || window.event.ctrlKey) return; // prevent new line
      const x = parseInt(input.style.left, 10);
      const y = parseInt(input.style.top, 10);
      let message = input.value;
      let url = window.location.href;

      // switch network if it is not Gnosis Chain
      let provider = (new ethers.providers.Web3Provider(window.ethereum, "any"));
      (provider.getNetwork()).then((network) => {
        console.log(`Network ${network.chainId}: ${network.name} at ${network.ensAddress}`);

        function post2CH3() {
          // Connect to Metamask
          (provider.send("eth_requestAccounts", [])).then((accounts) => {
            console.log(`Accounts: ${accounts}; Selecting the first account...`);
            (provider.getBalance(accounts[0])).then((balance) => {
              console.log(`Accounts: ${accounts[0]}; Balance: ${balance}`);
              if (balance == 0) {
                console.log("You need to have balance to use this extension.")
                // TODO: play mode
                return;
              }
              
              // Initialize Contract
              const contract = new ethers.Contract(contractAddress, abi, provider.getSigner());
              contract.post(message, url, x, y).then((transaction) => {
                console.log(`Transaction sent, waiting for confirmation...`);
                transaction.wait(1).then((confirm) => {
                  console.log(confirm);
                  console.log(`Transaction Confirmed!`);
                });
              }, (errno) => console.log(`Error ${errno.code}: ${errno.message}`));

            });

          }, (errno) => console.log(`Error ${errno.code}: ${errno.message}`));
        }

        if (network.chainId != 100) {
          (window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId: "0x64",
              rpcUrls: ["https://rpc.gnosischain.com/"],
              chainName: "Gnosis Chain",
              nativeCurrency: {
                name: "xDai",
                symbol: "xDai",
                decimals: 18
              },
              blockExplorerUrls: ["https://blockscout.com/xdai/mainnet/"]
            }]
          })).then(() => {
            // tell the user what is the current network after switch
            // there isn't control flow error code returned
            (provider.getNetwork()).then((network) => {
              console.log(`Network ${network.chainId}: ${network.name} at ${network.ensAddress}`);
              if (network.chainId != 100) {
                console.log("You need to be on Gnosis Chain to use this extension.");
                return;
              }
              post2CH3();
            })
          });
        } else {
          post2CH3();
        }
      }, (errno) => console.log(`Error ${errno.code}: ${errno.message}`));


      // postMessage(message, url, x, y).then((success) => {
      //   if (success) {
      //     addComment(x, y, message);
      //     activeInput.remove();
      //     activeInput = undefined;
      //   } else {
      //     console.log("Failed");
      //   }
      // });
    }
  })
  input.id = "input";
  input.name = "input";

  let form = document.createElement("form");
  form.action = "";
  form.autocomplete = "off";
  form.onsubmit = () => {return false;};
  form.appendChild(input);
  document.getElementById("inputs").appendChild(form);

  input.focus();
  activeInput = form;
}

function onLoad() {
  if (loaded) return;
  loaded = true;
  document.addEventListener("click", onClick);

  let inputs_div = document.createElement("div");
  inputs_div.id = "inputs";
  document.body.appendChild(inputs_div);
  let comments_div = document.createElement("div");
  comments_div.id = "comments";
  document.body.appendChild(comments_div);
  console.log("2ch3 Initialized Successfully!");
}

// https://developer.chrome.com/docs/extensions/mv3/content_scripts/
document.addEventListener('DOMContentLoaded', onLoad, {once: true}); // once is important
onLoad();
// BUG: adhoc
window.CH3_ENABLED = true;
console.log(`DEBUG: Set window.CH3_ENABLED to ${window.CH3_ENABLED}`);