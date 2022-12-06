/**Core function used to either create or update a existing node */
function update_or_create_node(old_url, new_url, created, updated, clickCount, tags, name, description, parent, children, type, initial = null) {
    //if url changed, delete form database since url is the primary key of the nodes
    old_url = old_url.replaceAll(" ", "-")
    new_url = new_url.replaceAll(" ", "-")
    parent = parent.replaceAll(" ", "-")

    if (old_url !== new_url) {
        delete_node(old_url)
    }

    if (name !== name) {
        delete_node(name)
    }

    let data = {}
    data[new_url] = {
        created: parseInt(created), 
        updated: parseInt(updated), 
        clickCount: parseInt(clickCount),
        tags: tags, 
        name: name, 
        description: description, 
        parent: parent, 
        children: children, 
        type: type, 
    }

    browser.storage.local.set(data)

    //Refresh UI with matching folder preselected
    if (initial) {
        refresh_ui(initial, type)
    }
}

/**Delete Node with the given URL */
function delete_node(url) {
    browser.storage.local.remove(url)
}


/**Move Node to a new target directory */
function move_nodes(url_list, new_folder, initial = null) {
    //reverse array, so folders are at the end of array (refresh_ui gets called at last iteration and wouldn't update folder sidebar if last node is a bookmark)
    url_list = url_list.reverse()
    for (let idx = 0; idx < url_list.length; idx++) {
        let url = url_list[idx]
        browser.storage.local.get(url).then(function (data) {
            let node = data[url];
            let init = initial;
            //Only refresh page on last node update
            if (idx != url_list.length - 1) {
                init = null
            }
            update_or_create_node(url, url, node.created, Date.now(), node.clickCount, node.tags, node.name, node.description, new_folder, node.children, node.type, init)
        })
    }
}



