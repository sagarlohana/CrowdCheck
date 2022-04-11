
function getTitlesAndLinks() {
    var arr = [...document.getElementsByTagName('h3')];

    var filteredHeadings = [];
    var filteredLinks = [];

    arr.forEach(x => filteredHeadings.push(x.innerText));
    arr.forEach(x => filteredLinks.push(x.baseURI));
    console.log(filteredHeadings)
    console.log("*******************")
    console.log(filteredLinks)
}

// If button is not disabled, run script
console.log(window.location.href)
getTitlesAndLinks()

