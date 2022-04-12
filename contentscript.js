var enabled = false
chrome.storage.sync.set({'enabled': false})

function getTitlesAndLinks() {
    var arr = [...document.getElementsByTagName('h3')];

    var filteredHeadings = [];
    var filteredLinks = [];

    arr.forEach(x => filteredHeadings.push(x.innerText));
    arr.forEach(x => filteredLinks.push(x.baseURI));
    return [filteredHeadings, filteredLinks]
}

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

function pushPageRanking(links, headings, email) {
    links.forEach((link, i) => {
        data = {
            "userID": email,
            "url": link,
            "vote": 1 // TODO: SATVIR Retrieve vote from report button
        }
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

currentURL = window.location.href
console.log("CurrentURL", currentURL)

chrome.storage.sync.get(['email']).then((val)=> {
    links = []
    headings = []
    if (currentURL.indexOf("search?q=") > 0) {
        [headings, links] = getTitlesAndLinks()
    } else {
        links.push(currentURL)
    }
    // getPageRanking(links, val.email)
    // pushPageRanking(links, headings, val.email)
})
