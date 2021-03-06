/**
 * injectScript - Inject internal script to available access to the `window`
 *
 * @param  {type} file_path Local path of the internal script.
 * @param  {type} tag The tag as string, where the script will be append (default: 'body').
 * @see    {@link http://stackoverflow.com/questions/20499994/access-window-variable-from-content-script}
 * @see    {@link https://gist.github.com/devjin0617/3e8d72d94c1b9e69690717a219644c7a}
 */
function injectScript(file_path, tag) {
  var node = document.getElementsByTagName(tag)[0];
  var script = document.createElement('script');
  script.setAttribute('type', 'text/javascript');
  script.setAttribute('src', file_path);
  node.appendChild(script);
}

/**
 * only {@link inject.js} can see {@function chrome.storage.sync.get}
 */
chrome.storage.sync.get("CH3", ({ CH3 }) => {
  window.CH3_ENABLED = CH3;
  console.log(`Set window.CH3_ENABLED to ${window.CH3_ENABLED}`);
  // TODO: inject a script that changes [window.CH3_ENABLED = CH3;]
});

// Note: this is depricated [injectScript(chrome.extension.getURL('content.js'), 'body');]
// BUG: don't inject [ethers-5.2.umd.min.js] if it is already on the page
injectScript(chrome.runtime.getURL('ethers-5.2.umd.min.js'), 'head');
injectScript(chrome.runtime.getURL('content.js'), 'body');