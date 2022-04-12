var enabled = false
chrome.storage.sync.set({'enabled': false})

// Retrieve all headings and associated links for a Google Search
function getTitlesAndLinks() {
    var arrLinks = [...document.getElementsByClassName('yuRUbf')]
    var arrHeadings = [...document.getElementsByClassName('LC20lb MBeuO DKV0Md')]
    var arrScoreSpan = arrLinks.slice();

    //        arrScoreSpan.push(link.querySelector('.xTFaxe.IjabWd.z1asCe.SaPW2b'))

    // arrLinks.forEach(link => {
    //     arrScoreSpan.push(link.querySelector('.xTFaxe.IjabWd.z1asCe.SaPW2b'))
    // })

    var filteredHeadings = [];
    var filteredLinks = [];

    arrHeadings.forEach(x => filteredHeadings.push(x.innerText));
    arrLinks.forEach(x => filteredLinks.push(x.firstChild.href));
    // console.log(filteredHeadings)
    // console.log(filteredLinks)
    // console.log(arrScoreSpan)
    return [filteredHeadings, filteredLinks, arrScoreSpan]
}


// Call GET Endpoint to retrieve URL ranking for user/email
function refreshPageRanking(links, email, scoreSpans) {
    scoreData = []
    links.forEach((link, idx) => {
        console.log("Email: ", email, "Link: ", link)
        url = "https://gkm6y9vexh.execute-api.us-east-1.amazonaws.com/dev/pages?userID="+email+"&url="+link
        fetch(url, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(response => response.json())
        .then(data => {showScore(data, scoreSpans[idx]);
        console.log(data);
        console.log(scoreSpans);})
        .catch(err => console.log(err))
    })
}

// Call POST Endpoint to update URL ranking for user/email
function pushPageRanking(links, headings, email, vote) {
    links.forEach((link, i) => {
        data = {
            "userID": email,
            "url": link,
            "vote": vote // TODO: SATVIR Retrieve vote from report button
        }
        // Non-google search result pages won't have header
        if (headings.length > 0) {
            data["text"] = headings[i]
        }

        url = "https://gkm6y9vexh.execute-api.us-east-1.amazonaws.com/dev/pages"
        fetch(url, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        // .then(data => console.log(data))
        .catch(err => console.log(err))
    })
}

function showScore(scoreData, scoreSpan) {
    var a = scoreSpan.querySelector('.score');
    if (a) {
        a.innerHTML = scoreData.rating;
    } else {
        a = document.createElement('a');
        a.className = 'score';
        a.innerHTML = scoreData.rating;
        scoreSpan.appendChild(a);
    }
}



function pushIcons(spans, links, headings, email) {
    spans.forEach((span, idx) => {
        if (span) {
            // console.log(span);
            up = document.createElement("button");
            //upURL = chrome.runtime.getURL("./up.svg")
            upURL = 'https://www.svgrepo.com/show/41133/up-arrow.svg'
            up.className = "upButton vote-button";
            up.innerHTML = '<img src="' + upURL+ '" />';
            up.addEventListener("click", () => {
                pushPageRanking([links[idx]], [headings[idx]], email, 1);
                refreshPageRanking([links[idx]], email, [span]);
            })

            down = document.createElement("button");
            downURL = 'https://www.svgrepo.com/show/25790/down-arrow.svg'
            down.className = "downButton vote-button";
            down.innerHTML = '<img src="' + downURL+ '" />';
            down.addEventListener("click", () => {
                pushPageRanking([links[idx]], [headings[idx]], email, -1);
                refreshPageRanking([links[idx]], email, [span]);

            })

            span.appendChild(up);
            span.appendChild(down);
        }
    });

}

// Retrieve current URL to determine if we're on a search result page
currentURL = window.location.href
// console.log("CurrentURL", currentURL)

// Get email from local storage
chrome.storage.sync.get(['email']).then((val)=> {
    var headings, links, scoreSpans = []
    if (currentURL.indexOf("search?q=") > 0) {
        // We're on a Google Search result page, grab links and call API
        [headings, links, scoreSpans] = getTitlesAndLinks()
    } else {
        // Non-Google Search result, call API with current webpage (no-header)
        links.push(currentURL)
    }

    pushIcons(scoreSpans, links, headings, val.email); 
    refreshPageRanking(links, val.email, scoreSpans)
    // pushPageRanking(links, headings, val.email)
})

