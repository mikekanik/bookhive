/**Updates the Icon in the Add-on depending on
 * if the current Page is Bookmarked or not.
 */
function update_icon(){
    browser.tabs.query({active: true, currentWindow: true}).then(function (tabs) {
        let url = tabs[0].url
        browser.storage.local.get(url).then(function (data) {
            /**Checks if a Bookmark for this URL already exists.
             * if it does, fill the Add-on Icon.
             */
            if (data[url] != null) {
                browser.browserAction.setIcon({
                    path: {48: "icons/bookhive-icon.png"},
                    tabId: tabs[0].id
                });
            } else {
                browser.browserAction.setIcon({
                    path: {48: "icons/bookhive-icon-empty.png"},
                    tabId: tabs[0].id
                });
            }
        })
    });
}

/**Checks if Shortcut (CRTL+SHIFT+Y) is pressed,
 * and adds or removes a Bookmark afterwards
 * depending on if it already exists.
 */
browser.commands.onCommand.addListener(function(command) {
    if (command == "toggle-bookmark") {
        browser.tabs.query({active: true, currentWindow: true}).then(function (tabs) {
            let url = tabs[0].url
            let name = tabs[0].title
            browser.storage.local.get(url).then(function (data) {
                /**Remove the Bookmark if it already exists,
                 * create one otherwise.
                 */
                if (data[url] != null) {
                    browser.storage.local.remove(url)
                } else {
                    let data = {}
                    data[url] = {created: Date.now(), updated: Date.now(), tags: [], name: name, description: "", parent: "All-4902384039284039284", children: "", type: "bookmark"}
                    browser.storage.local.set(data)
                }
                update_icon()
            })
        });
    }
});

/**Updates Icon whenever a Bookmark as Added */
browser.tabs.onUpdated.addListener(update_icon);

/**Called on Tab Switch */
browser.tabs.onActivated.addListener(update_icon);

/**Caled on Window Switch */
browser.windows.onFocusChanged.addListener(update_icon);

/** Initial Function call */
update_icon();