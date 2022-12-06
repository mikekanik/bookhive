/**Export all Bookmarks in Bookhive to
 * a Netscape HTML FIle.
 */
function export_to_html() {
    browser.storage.local.get(null).then(function (data) {

        /**Get's always generated when creating a HTML File */
        let content = '<!DOCTYPE NETSCAPE-Bookmark-file-1>\n' +
            '<!-- This is an automatically generated file.\n' +
            '     It will be read and overwritten.\n' +
            '     DO NOT EDIT! -->\n' +
            '<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">\n' +
            '<TITLE>Bookmarks</TITLE>\n' +
            '<H1>Lesezeichen-Menü</H1>\n\n'

        content += "<DL><p>\n"

        let data_arr = Object.keys(data)
        let nodes = []
        for (let idx = 0; idx < data_arr.length; idx++) {
            let node = data[data_arr[idx]]
            node.url = data_arr[idx]
            nodes.push(node)
        }

        function add_html(node, level) {
            if (node.type == "folder") {
                content += "\t".repeat(level)
                content += '<DT><H3 ADD_DATE="' + node.created / 1000 + '" LAST_MODIFIED="' + node.updated / 1000 + '">' + node.name + '</H3>\n'
                content += "\t".repeat(level)
                content += "<DL><p>\n"
            } else {
                content += "\t".repeat(level)
                content += '<DT><A HREF="' + node.url + '" ADD_DATE="' + node.created / 1000 + '" LAST_MODIFIED="' + node.updated / 1000 + '">' + node.name + '</A>\n'
            }

            let children = nodes.filter(child_node => child_node.parent == node.url)
            for (let child of children) {
                add_html(child, level + 1)
            }

            if (node.type == "folder") {
                content += "\t".repeat(level)
                content += "</DL><p>\n"
            }
        }

        let root_nodes = nodes.filter(node => node.parent == "root" || node.parent == "All-4902384039284039284")

        for (let root_node of root_nodes) {
            add_html(root_node, 1)
        }

        content += "</DL>\n"

        //Export link idea from
        // https://stackoverflow.com/questions/22084698/how-to-export-source-content-within-div-to-text-html-file
        // (Lu Roman) (visited 12.02.2022)

        let download_link = document.createElement('a')
        download_link.setAttribute('href', 'data:text/html;charset=utf-8,' + encodeURIComponent(content))
        download_link.setAttribute('download', "bookhive_export.html")
        download_link.click()
        download_link.remove()
    })
}

/**Export all Bookmarks in Bookhive
 * to a JSON File.
 */
function export_to_json() {
    browser.storage.local.get(null).then(function (data) {
        let content = JSON.stringify(data, null, 2)

        //Export link idea from
        // https://stackoverflow.com/questions/22084698/how-to-export-source-content-within-div-to-text-html-file
        // (Lu Roman) (visited 12.02.2022)
        let download_link = document.createElement('a')
        download_link.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(content))
        download_link.setAttribute('download', "bookhive_export.json")
        download_link.click()
        download_link.remove()
    })
}

/**Read a Input HTML File and pass it to
 * import_node.
 */
function import_bookmarks_from_html(file) {
    let html = new DOMParser().parseFromString(file, "text/html");
    let bookmarks = html.body.children[1]
    import_node(bookmarks)
    refresh_ui()
}

/**Create Bookmarks depending on JSON
 * Input content.
 */
function import_bookmarks_from_json(file) {
    let data = JSON.parse(file)
    for (const [url, node] of Object.entries(data)) {
        if (url != "options-893274923847982") {
            update_or_create_node(url, url, node.created, node.updated, node.clickCount, node.tags, node.name, node.description, node.parent, node.children, node.type)
        }
    }
    refresh_ui()
}

/**Import the bookmarks into bookhive */
function import_node(node) {
    if (node.attributes && node.attributes.add_date) {
        let parent = "root"
        let parent_node = node.parentNode.parentNode.previousSibling.previousSibling
        if (parent_node && parent_node.attributes.length > 0) {
            // let parent_node = node.parentNode.parentNode.previousSibling.previousSibling
            parent = parent_node.innerHTML
        }
        if (parent.includes("Lesezeichen-Menü") || parent == "") {
            parent = "root"
        }
        let created = node.attributes.add_date.nodeValue * 1000
        //Fix for chrome bookmarks files since they dont have a modified date for every node
        let updated = Date.now()
        if (node.attributes.last_modifed) {
            updated = node.attributes.last_modified.nodeValue * 1000
        }
        let name = node.innerHTML
        //Is Bookmark - Mozilla identifies bookmarks nodes by them having a href attribute
        if (node.attributes.href) {
            let url = node.attributes.href.nodeValue
            let tags = []
            if (node.attributes.tags) {
                tags = node.attributes.tags.nodeValue.split(",")
            }
            if (!url.endsWith("/")) {
                update_or_create_node(url + "/", url + "/", created, updated, 0, tags, name, "", parent, null, "bookmark", null)
            } else {
                update_or_create_node(url, url, created, updated, 0, tags, name, "", parent, null, "bookmark", null)
            }
            // Is Folder
        } else {
            let children = []
            //Add created unix timestamps to url for preventing duplicates
            let url = node.innerHTML + "-" + created
            update_or_create_node(url, name, created, updated, 0, [], name, "", parent, children, "folder", null)
        }
    }
    if (node.children) {
        for (child of node.children) {
            import_node(child);
        }
    }
}