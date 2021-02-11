function handleMessage(request, sender, sendResponse) {
    console.log("Message from the content script: ", request);
    checkForTypes(request.name).then((response) => sendResponse(response), error => {
        console.error(error.stack)
        sendResponse({
            error: true,
            message: error.message
        })
    })
    return true;
}

async function checkForTypes(packageName) {
    const response = await fetch(`https://skimdb.npmjs.com/registry/${encodeURIComponent(packageName)}`, {
    })
    const entry = await response.json()
    const latestVersionNumber = entry["dist-tags"].latest;
    const latestVersion = entry.versions[latestVersionNumber];
    return {hasTypes: latestVersion?.types != null}
}


chrome.runtime.onMessage.addListener(handleMessage);