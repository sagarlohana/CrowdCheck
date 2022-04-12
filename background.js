// Store user email
function setEmail() {
    chrome.identity.getProfileUserInfo((info) => { 
        chrome.storage.sync.set({'email': info.email})
    });
}

chrome.identity.onSignInChanged.addListener(setEmail)
setEmail();