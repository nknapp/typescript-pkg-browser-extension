const observer = new MutationObserver((mutationsList, observer) => {
    for (const mutation of mutationsList) {
        switch (mutation.type) {
            case "childList":
                checkAndAddMarker(mutation.target, "mutation").catch(console.error)
                checkAllChildrenOf(mutation.target).catch(console.error)
                break;
            case 'attributes':
                break;
        }
    }
});

observer.observe(document.body, {attributes: true, childList: true, subtree: true});

checkAllChildrenOf(document).catch(console.error);


async function checkAllChildrenOf(container) {
    const links = container.querySelectorAll("a[href]")
    for (const link of links) {
        await checkAndAddMarker(link).catch(console.error)
    }

}

async function checkAndAddMarker(element, reason) {
    if (element.__ts_pkg_checked) {
        return
    }
    element.__ts_pkg_checked = true;
    console.debug("checkAndAddMarker", reason, element)
    if (element.tagName.toLowerCase() !== 'a') {
        return
    }
    const hrefMatch = element.getAttribute("href").match(/^\/package\/(.*)$/);
    if (hrefMatch == null) {
        return
    }
    const packageName = decodeURIComponent(hrefMatch[1]);

    console.debug("a", packageName)
    if (await hasTypes(packageName)) {
        const newChild = document.createElement("div");
        newChild.style.display = 'inline-block';
        newChild.style.backgroundColor = '#4444ff';
        newChild.style.border = '1px solid #222277';
        newChild.style.fontSize = 'smaller';
        newChild.style.color = 'white';
        newChild.style.textAlign = 'center';
        newChild.innerText = 'T';
        newChild.style.width = '1rem';
        newChild.style.marginRight = '0.5rem';
        element.prepend(newChild)
    }
}

async function hasTypes(packageName) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
            type: 'hasTypes',
            name: packageName
        }, (response) => {
            console.log(response)
            if (response.error != null) {
                return reject(new Error(response.message))
            }
            return resolve(response.hasTypes);
        });
    })


}

