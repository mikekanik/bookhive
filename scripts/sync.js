/**Used later to check if Firefox has Nodes,
 * so we can access their ID and Title.
 */
var ffChildren = [];

function loadChildren() {
    browser.bookmarks.getTree().then(function (data) {
        getFirefoxChildren(data[0].children[2])
    })
}

function getFirefoxChildren(node) {
    if (node.children) {
        for (child of node.children) {
            ffChildren.push(child)
            getFirefoxChildren(child)
        }

    }
}

loadChildren()

/**Checks if you deleted a Node in Firefox,
 * if it does find a deleted Firefox Node
 * delete it in Bookhive aswell.
*/
function deleteBookhiveNode(id, ffNode) {
    browser.storage.local.get(null).then(function (data) {
        let data_arr = Object.keys(data)
        for (let idx = 0; idx < data_arr.length; idx++) {
            let node = data[data_arr[idx]]
            node.url = data_arr[idx]

            if (node.url == "options-893274923847982") {
                continue;
            }

            /**Checks if a Bookhive Node with the same Title or URL
             * exists as the Firefix Node that has been deleted.
             * If it does, delete the Bookhive Node with all it's children.
            */
            if (node.name == ffNode.node.title || node.url == ffNode.node.url) {
                deleteChildren(node)
                function deleteChildren(node) {
                    if (node.children) {
                        for (child of node.children) {
                            delete_node(child.url)
                            deleteChildren(child)
                        }
                    }
                }
                delete_node(node.url)
                refresh_ui()
            }
        }
    })
}

/**Checks if a Node in Firefox has been Moved,
 * if it does find the Bookhive Node with the
 * same Name and move it aswell.
 */
function moveBookhiveNode(id, ffNode) {
    browser.bookmarks.get(id).then(function (data) {
        const fireFoxNode = data[0]
        browser.storage.local.get(null).then(function (bhdata) {
            let data_arr = Object.keys(bhdata)
            for (let idx = 0; idx < data_arr.length; idx++) {
                let node = bhdata[data_arr[idx]]
                node.url = data_arr[idx]

                if (node.url == "options-893274923847982") {
                    continue;
                }

                /**Checks if a Bookhive Node with the same as the
                 * Moved Firefox Node exists, if it does get the
                 * Parent Title of the Firefox Node, and move
                 * it in Bookhive aswell.
                 */
                if (node.name == fireFoxNode.title) {
                    browser.bookmarks.get(fireFoxNode.parentId).then(function (parent) {
                        moveSync(node.url, parent[0].title)
                    })
                }
            }
        })
    })

}

function moveSync(current_folder, new_folder) {
    browser.storage.local.get(current_folder).then(function (data) {
        let node = data[current_folder];
        new_folder = new_folder.replaceAll(" ", "-")
        node.parent = new_folder
        browser.storage.local.set(data)
    })
}

/**Used to call the syncNodes function,
 * going through all Firefox Nodes.
*/
function bookhiveSync() {
    browser.bookmarks.getTree().then(function (data) {
        syncNodes(data[0].children[2], "root")
    })
}

/**Unschoen, muss noch geaendert werden */
function firefoxSync() {
    syncFirefoxNodes()
    setTimeout(function () {
        browser.bookmarks.onRemoved.addListener(deleteBookhiveNode);
    }, 2000)
}

/**Called when Delete All Button is pressed,
 * Delete ALL Firefox Objjects.
 */
function clearFfNodes() {
    browser.bookmarks.getTree().then(function (data) {
        const ffdata = data[0].children[2]
        if (ffdata.children) {
            for (let i = 0; i < ffdata.children.length; i++) {
                browser.bookmarks.removeTree(ffdata.children[i].id)
            }
        }
    })
}


/**Checks if a Firefox Node exists,and creates 
 * them in Bookhive if that's the case.
 */
function syncNodes(node, parent) {
    if (node.type == "bookmark") {
        if (node.title != "Weitere Lesezeichen") {
            update_or_create_node(node.url, node.url, node.dateAdded, node.dateGroupModified, 0, [], node.title, "", parent.title, node.children, "bookmark", null)
        }
    }

    if (node.type == "folder") {
        if (node.title != "Weitere Lesezeichen") {
            update_or_create_node(node.title, node.title, node.dateAdded, node.dateGroupModified, 0, [], node.title, "", parent.title ?? "root", [], "folder", null)
        }
    }

    /**Recursive call of the function if children
     * of a Node are found in Firefox.
     */
    if (node.children) {
        for (child of node.children) {
            syncNodes(child, node)
        }
    }
}

/**Checks if a Bookhive Node exists, and creates
 * them in Firefox if that's the case.
 */
function syncFirefoxNodes() {
    browser.storage.local.get(null).then(function (data) {
        let data_arr = Object.keys(data)
        let nodes = []
        for (let idx = 0; idx < data_arr.length; idx++) {
            let node = data[data_arr[idx]]
            node.url = data_arr[idx]
            nodes.push(node)
        }
        async function exportToFirefox(node, parentId) {
            if (node.type == "bookmark") {
                if (node.name != "Weitere Lesezeichen") {
                    /**Checks if a Firefox Node with the Same name
                     * already exists, and delete it before recreating it.
                     * This is necessary in order to load new Children Elements properly.
                     */
                    for (let fnode of ffChildren) {
                        if (fnode.url == node.url) {
                            browser.bookmarks.onRemoved.removeListener(deleteBookhiveNode);
                            browser.bookmarks.remove(fnode.id)
                        }
                    }
                    browser.bookmarks.create({
                        title: node.name,
                        url: node.url,
                        parentId: parentId
                    });
                }
            }
            else if (node.type == "folder") {
                if (node.name != "Weitere Lesezeichen") {
                    /**Checks if a Firefox Node with the Same name
                     * already exists, and delete it before recreating it.
                     * This is necessary in order to load new Children Elements properly.
                     */

                    for (let fnode of ffChildren) {
                        if (fnode.title == node.name) {
                            browser.bookmarks.onRemoved.removeListener(deleteBookhiveNode);
                            browser.bookmarks.removeTree(fnode.id)
                        }

                    }
                    var firefoxNode = await browser.bookmarks.create({
                        title: node.name,
                        url: null,
                        parentId: parentId
                    })
                    parentId = firefoxNode.id
                }

            }


            /**Call the Function recursive for 
             * every Child Element in Bookhive .
             */
            for (let child of nodes.filter(child_node => child_node.parent == node.url)) {
                exportToFirefox(child, parentId)
                // browser.bookmarks.onRemoved.addListener(deleteBookhiveNode);
            }
        }

        let root_nodes = nodes.filter(node => node.parent == "root" || node.parent == "All-4902384039284039284" || node.parent == "Weitere-Lesezeichen")

        for (let root_node of root_nodes) {
            exportToFirefox(root_node)
        }

    })
}

/**Call deleteBookhiveNode everytime
 *  a Node in Firefox is removed.
 */
browser.bookmarks.onRemoved.addListener(deleteBookhiveNode);

/**Call moveBookhiveNode everytime
 * a Node in Firefox is moved.
 */
browser.bookmarks.onMoved.addListener(moveBookhiveNode);
