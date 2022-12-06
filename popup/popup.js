$(document).ready(function () {
    update_button()
    load_root_folders()
});

function load_root_folders() {
    //Get root folder from settings
    browser.storage.local.get("options-893274923847982").then(function (data) {
        let root_folder = 'root'
        let options = data["options-893274923847982"]
        //If extension is used the first time, set options
        if (options) {
            root_folder = options.root_folder
        }
        browser.storage.local.get(null).then(function (data) {
            let data_arr = Object.keys(data)
            for (let idx = 0; idx < data_arr.length; idx++) {
                let node = data[data_arr[idx]]
                node.url = data_arr[idx]
                //Ignore Option Storage Object
                if (node.url == "options-893274923847982") {
                    continue;
                }
                if (node.type == 'folder' && (node.parent == root_folder)) {
                    $("#folder_select").append("<option value='" + node.url + "'>" + node.name + "</option>")
                }
            }
        })
    })
}

function toggle_bookmark(url, name) {
    browser.storage.local.get(url).then(function (data) {
        //If bookmark exists, remove bookmark, otherwise add bookmark to storage
        if (data[url] != null) {
            delete_node(url)
            update_button()
        } else {
            let parent = $("#folder_select").val()
            update_or_create_node(url, url, Date.now(), Date.now(), 0, [], name, "", parent, "", "bookmark")
            update_button()
        }
    })
}

function update_button() {
    browser.tabs.query({ active: true, currentWindow: true }).then(function (tabs) {
        let url = tabs[0].url
        browser.storage.local.get(url).then(function (data) {
            //If api returned anything else than null, url is already bookmarked
            let button = $('#bookmark')
            if (data[url] != null) {
                button.removeClass("btn-outline-success")
                button.addClass("btn-danger")
                button.html("Unbookmark")
                //set browser icon to filled one
                browser.browserAction.setIcon({
                    path: { 48: "/icons/bookhive-icon.png" },
                    tabId: tabs[0].id
                });
            } else {
                button.removeClass("btn-danger")
                button.addClass("btn-outline-success")
                button.html("Bookmark")
                //set browser icon to empty one
                browser.browserAction.setIcon({
                    path: { 48: "/icons/bookhive-icon-empty.png" },
                    tabId: tabs[0].id
                });
            }
        })
    });
}

$('#home_btn').click(function () {
    browser.tabs.create({ url: "/page/home.html" });
})

$("#bookmark").click(function () {
    browser.tabs.query({ active: true, currentWindow: true }).then(function (tabs) {
        toggle_bookmark(tabs[0].url, tabs[0].title)
    });
});
