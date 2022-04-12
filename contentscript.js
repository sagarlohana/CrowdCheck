var enabled = false
chrome.storage.sync.set({'enabled': false})

// Retrieve all headings and associated links for a Google Search
function getTitlesAndLinks() {
    var arrLinks = [...document.getElementsByClassName('yuRUbf')]
    var arrHeadings = [...document.getElementsByClassName('LC20lb MBeuO DKV0Md')]
    var filteredHeadings = [];
    var filteredLinks = [];

    arrHeadings.forEach(x => filteredHeadings.push(x.innerText));
    arrLinks.forEach(x => filteredLinks.push(x.firstChild.href));
    console.log(filteredHeadings)
    console.log(filteredLinks)
    return [filteredHeadings, filteredLinks]
}

// Call GET Endpoint to retrieve URL ranking for user/email
function getPageRanking(links, email) {
    links.forEach((link) => {
        console.log("Email: ", email, "Link: ", link)
        url = "https://gkm6y9vexh.execute-api.us-east-1.amazonaws.com/dev/pages?userID="+email+"&url="+link
        fetch(url, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(err => console.log(err))
    })
}

// Call POST Endpoint to update URL ranking for user/email
function pushPageRanking(links, headings, email) {
    links.forEach((link, i) => {
        data = {
            "userID": email,
            "url": link,
            "vote": 1 // TODO: SATVIR Retrieve vote from report button
        }
        // Non-google search result pages won't have header
        if (headings.length > 0) {
            data["text"] = headings[i]
        }

        url = "https://gkm6y9vexh.execute-api.us-east-1.amazonaws.com/dev/pages"
        console.log(data)
        fetch(url, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(err => console.log(err))
    })
}

// Retrieve current URL to determine if we're on a search result page
currentURL = window.location.href
console.log("CurrentURL", currentURL)

// Get email from local storage
chrome.storage.sync.get(['email']).then((val)=> {
    var headings, links = []
    if (currentURL.indexOf("search?q=") > 0) {
        // We're on a Google Search result page, grab links and call API
        [headings, links] = getTitlesAndLinks()
    } else {
        // Non-Google Search result, call API with current webpage (no-header)
        links.push(currentURL)
    }
    // getPageRanking(links, val.email)
    // pushPageRanking(links, headings, val.email)
})
