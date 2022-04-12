// Store user email
chrome.identity.getProfileUserInfo((info) => { 
    chrome.storage.sync.set({'email': info.email})
});
