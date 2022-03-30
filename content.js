/**
 * 2ch3 - Inject internal script to available access to the `window`
 *
 * Functionality
 * 1. You can post any text message permanently on any website for only 10th of a cent
 * 2. You can see other people's message on the same website
 * 3. You can listen to the incoming messages
 */
let activeInput;
let loaded = false;

const contractAddress = '0x3cE619987873bA4C1FD02aBD4b65fefF7826072D';
const abi = [{"type":"constructor","stateMutability":"nonpayable","inputs":[]},{"type":"event","name":"MessageEdit","inputs":[{"type":"uint256","name":"messageNonce","internalType":"uint256","indexed":false},{"type":"address","name":"owner","internalType":"address","indexed":true},{"type":"uint256","name":"ownerNonce","internalType":"uint256","indexed":false},{"type":"uint256","name":"timestamp","internalType":"uint256","indexed":false},{"type":"uint256","name":"lastTempChange","internalType":"uint256","indexed":false},{"type":"uint256","name":"x","internalType":"uint256","indexed":false},{"type":"uint256","name":"y","internalType":"uint256","indexed":false},{"type":"bytes16","name":"temperature","internalType":"bytes16","indexed":false},{"type":"string","name":"payload","internalType":"string","indexed":false},{"type":"string","name":"url","internalType":"string","indexed":true}],"anonymous":false},{"type":"event","name":"MessageSent","inputs":[{"type":"uint256","name":"messageNonce","internalType":"uint256","indexed":false},{"type":"address","name":"owner","internalType":"address","indexed":true},{"type":"uint256","name":"ownerNonce","internalType":"uint256","indexed":false},{"type":"uint256","name":"timestamp","internalType":"uint256","indexed":false},{"type":"uint256","name":"lastTempChange","internalType":"uint256","indexed":false},{"type":"uint256","name":"x","internalType":"uint256","indexed":false},{"type":"uint256","name":"y","internalType":"uint256","indexed":false},{"type":"bytes16","name":"temperature","internalType":"bytes16","indexed":false},{"type":"string","name":"payload","internalType":"string","indexed":false},{"type":"string","name":"url","internalType":"string","indexed":true}],"anonymous":false},{"type":"fallback","stateMutability":"payable"},{"type":"function","stateMutability":"view","outputs":[{"type":"uint256","name":"","internalType":"uint256"}],"name":"DEBUG_TIME","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"address","name":"","internalType":"address payable"}],"name":"OWNER","inputs":[]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"destroy","inputs":[]},{"type":"function","stateMutability":"payable","outputs":[],"name":"downVote","inputs":[{"type":"uint256","name":"messageId","internalType":"uint256"}]},{"type":"function","stateMutability":"payable","outputs":[],"name":"edit","inputs":[{"type":"string","name":"payload","internalType":"string"},{"type":"uint256","name":"messageId","internalType":"uint256"}]},{"type":"function","stateMutability":"view","outputs":[{"type":"uint256","name":"","internalType":"uint256"}],"name":"messageNonce","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"address","name":"owner","internalType":"address"},{"type":"uint256","name":"ownerNonce","internalType":"uint256"},{"type":"uint256","name":"timestamp","internalType":"uint256"},{"type":"uint256","name":"lastTempChange","internalType":"uint256"},{"type":"uint256","name":"x","internalType":"uint256"},{"type":"uint256","name":"y","internalType":"uint256"},{"type":"bytes16","name":"temperature","internalType":"bytes16"},{"type":"string","name":"payload","internalType":"string"},{"type":"string","name":"url","internalType":"string"}],"name":"messages","inputs":[{"type":"uint256","name":"","internalType":"uint256"}]},{"type":"function","stateMutability":"view","outputs":[{"type":"uint256","name":"","internalType":"uint256"}],"name":"ownerNonces","inputs":[{"type":"address","name":"","internalType":"address"}]},{"type":"function","stateMutability":"payable","outputs":[],"name":"post","inputs":[{"type":"string","name":"payload","internalType":"string"},{"type":"string","name":"url","internalType":"string"},{"type":"uint256","name":"x","internalType":"uint256"},{"type":"uint256","name":"y","internalType":"uint256"}]},{"type":"function","stateMutability":"view","outputs":[{"type":"tuple[]","name":"filteredMessages","internalType":"struct CH3.Message[]","components":[{"type":"address","name":"owner","internalType":"address"},{"type":"uint256","name":"ownerNonce","internalType":"uint256"},{"type":"uint256","name":"timestamp","internalType":"uint256"},{"type":"uint256","name":"lastTempChange","internalType":"uint256"},{"type":"uint256","name":"x","internalType":"uint256"},{"type":"uint256","name":"y","internalType":"uint256"},{"type":"bytes16","name":"temperature","internalType":"bytes16"},{"type":"string","name":"payload","internalType":"string"},{"type":"string","name":"url","internalType":"string"}]}],"name":"read","inputs":[{"type":"string","name":"url","internalType":"string"}]},{"type":"function","stateMutability":"payable","outputs":[],"name":"upVote","inputs":[{"type":"uint256","name":"messageId","internalType":"uint256"}]},{"type":"function","stateMutability":"view","outputs":[{"type":"uint256","name":"","internalType":"uint256"}],"name":"url2MessageId","inputs":[{"type":"string","name":"","internalType":"string"},{"type":"uint256","name":"","internalType":"uint256"}]},{"type":"receive","stateMutability":"payable"}]

let provider;

function displayableHex(a) {
  let str = `${a}`;
  return `${str.substring(0, 4)}...${str.slice(-4)}`;
}

function switchNetwork(callback) {
  (provider.getNetwork()).then((network) => {
    console.log(`Network ${network.chainId}: ${network.name} at ${network.ensAddress}`);

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
          callback();
        })
      });
    } else {
      callback();
    }
  }, (errno) => console.log(`Error ${errno.code}: ${errno.message}`));
}

function post2CH3(message, url, x, y, successCallback, failureCallback) {
  // Connect to Metamask
  (provider.send("eth_requestAccounts", [])).then((accounts) => {
    console.log(`Accounts: ${accounts}; Selecting the first account...`);
    (provider.getBalance(accounts[0])).then((balance) => {
      console.log(`Accounts: ${accounts[0]}; Balance: ${balance}`);
      if (balance == 0) {
        console.log("You need to have balance to use this extension.")
        // TODO: play mode
        failureCallback();
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
        successCallback();
      }, (errno) => {
        console.log(`Error ${errno.code}: ${errno.message}`);
        failureCallback();
      });

    });

  }, (errno) => {
    console.log(`Error ${errno.code}: ${errno.message}`);
    failureCallback();
  });
}

// function read2CH3() {
//   const contract = new ethers.Contract(contractAddress, abi, provider);

//   contract.messageNonce().then((nonce) => {
//     console.log(`Got nonce = ${nonce}`);
//     for (let i = 0; i < nonce; i++) {
//       console.log(`loading message ${i}`);
//       contract.messages(i).then((message) => {
//         console.log(`${message.x}, ${message.y}: ${message.payload}`);
//         addComment(message.x, message.y, message.payload);
//       }, (errno) => console.log(`Error ${errno.code}: ${errno.message}`));
//     }
//   }, (errno) => console.log(`Error ${errno.code}: ${errno.message}`));
// }

function read2CH3(url) {
  const contract = new ethers.Contract(contractAddress, abi, provider);
  document.querySelectorAll('.ch3').forEach(e => e.remove());

  contract.read(url).then((filteredMessages) => {
    filteredMessages.map((message) => {
      console.log(`${message.x}, ${message.y}: ${message.payload}`);
      addComment(message.payload, message.x, message.y, message.owner, message.timestamp, message.temperature);
    });
  }, (errno) => console.log(`Error ${errno.code}: ${errno.message}`));
}

function addComment(value, x, y, owner, timestamp, temperature) {
  let comment = document.createElement("p");
  // TODO: show id when hover
  // TODO: parse comment id
  comment.className = 'ch3';
  comment.owner = owner;
  comment.timestamp = timestamp;
  comment.temperature = temperature;
  comment.style = `font-family: monospace; margin: 0; padding: 0; border: none; position:absolute; top: ${y}px; left: ${x}px; background-color: #00000000; outline-width: 0; -webkit-box-shadow: none; -moz-box-shadow: none; box-shadow: none; width: ${document.body.scrollWidth - x}px; max-height: ${document.body.scrollHeight - y}px; word-break: break-all; overflow: hidden;`;
  comment.innerText = value;
  document.getElementById("comments").appendChild(comment);
  return comment;
}

function onClick(event) {
  // TODO: long click to activate only
  console.log("Click Event Registered");
  if (event.target.className == 'ch3') {
    console.log("You are clicking an existing comment!");
    // TODO: edit mode
    return;
  }
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
      switchNetwork(() => {
        post2CH3(message, url, x, y, () => {
          // successful submit and comfirmed
          read2CH3(url);
          activeInput.remove();
          activeInput = undefined;
        }, () => {
          // not successful submit
          console.log("You probably rejected the transaction?");
          if (activeInput != undefined) {
            activeInput.remove();
            activeInput = undefined;
          }
        });
      });
    }
  })
  input.id = "input";
  input.name = "input";

  let form = document.createElement("form");
  form.action = "";
  form.autocomplete = "off";
  form.onsubmit = () => { return false; };
  form.appendChild(input);
  document.getElementById("inputs").appendChild(form);

  input.focus();
  activeInput = form;
}

function loadComments() {
  switchNetwork(() => {
    read2CH3(window.location.href);
  });
}

function onLoad2CH3() {
  // wait for ethers.js to load
  if (typeof ethers === "undefined") {
    console.log("ethers.js undefined, keep trying...");
    setTimeout(onLoad2CH3, 10);
    return;
  }
  if (loaded) return;
  loaded = true;

  // load Web3
  if (provider === undefined) provider = new ethers.providers.Web3Provider(window.ethereum, "any");

  document.addEventListener("click", onClick);

  // add DOM
  let inputs_div = document.createElement("div");
  inputs_div.id = "inputs";
  document.body.appendChild(inputs_div);
  let comments_div = document.createElement("div");
  comments_div.id = "comments";
  document.body.appendChild(comments_div);
  console.log("2ch3 Initialized Successfully! Loading Comments...");

  loadComments();
}

// https://developer.chrome.com/docs/extensions/mv3/content_scripts/
// document.addEventListener('DOMContentLoaded', onLoad2CH3, {once: true}); // once is important
onLoad2CH3();
// BUG: adhoc
window.CH3_ENABLED = true;
console.log(`DEBUG: Set window.CH3_ENABLED to ${window.CH3_ENABLED}`);