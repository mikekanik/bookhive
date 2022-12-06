//On document load finished
$(document).ready(function () {
    bookhiveSync()
    firefoxSync()
    refresh_ui()
    set_margin()
    load_options()
    $("body").tooltip({ selector: '[data-bs-toggle=tooltip]' });
    //Small delay because nodeCount doesn't get loaded properly otherwise
    setTimeout(treegraph, 80)
});

function stressTest() {
    for (let i = 0; i < 50; i++) {
        update_or_create_node("Test" + i, "Test" + i, Date.now(), Date.now(), 0, [], "Test" + i, "", "root", [], "folder")
    }
}

function clickCounter(clicked_node_url) {
    browser.storage.local.get(clicked_node_url).then(function (data) {
        const node = data[clicked_node_url]
        node.clickCount++
        browser.storage.local.set(data)
    })
}

// Launch Edit Node Modal and autofill inputs with existing values of node
function launch_edit_node_modal(clicked_node_url) {
    $("#edit-form").removeClass("hidden")
    $("#description-markdown").removeClass("hidden")
    $("#description-input").addClass("hidden")
    $("#input-node-url").val(clicked_node_url)
    $("#input-node-old-url").val(clicked_node_url)
    browser.storage.local.get(clicked_node_url).then(function (data) {
        const node = data[clicked_node_url];
        $("#input-node-title").val(node.name)

        $("#description-markdown").html("")
        if (!node.description) {
            $("#description-markdown").append("<p>No Description yet </p>")
        } else {
            $("#description-markdown").append(marked.parse(node.description))
        }
        //hide URL if type is folder so user cant fuck up the folder tree
        if (node.type == "folder") {
            $(".input-node-url-row").hide()
        } else {
            $(".input-node-url-row").show()
        }

        $("#input-node-description").val(node.description)
        $("#input-node-tags").val(node.tags)
        $("#input-node-parent").val(node.parent)
        $("#input-node-children").val(node.children)
        $("#input-node-type").val(node.type)
        $("#input-node-created").val(node.created)
        $("#input-node-updated").val(node.updated)
        $("#input-node-clickCount").val(node.clickCount)
        $("#edit-node-modal-created").text("Created: " + new Date(node.created).toLocaleDateString())
        $("#edit-node-modal-updated").text("Updated: " + new Date(node.updated).toLocaleDateString())
        //Set edit modal title and put first char from node type ot upper case
        $("#edit-node-modal-label").text("Edit " + node.type.charAt(0).toUpperCase() + node.type.slice(1))
    })
}


//Updates node tags in Storage and updates UI
function toggle_tag(url, tag, initital = null) {
    browser.storage.local.get(url).then(function (data) {
        const node = data[url];
        const tags = node.tags
        //If node has tag, delete it. Else add it.
        if (tags.includes(tag)) {
            const index = tags.indexOf(tag);
            tags.splice(index, 1)
        } else {
            tags.push(tag)
        }
        if (initital) {
            initital = node.parent
        }
        update_or_create_node(url, url, node.created, node.updated, node.clickCount, tags, node.name, node.description, node.parent, node.children, node.type, initital)
    })
}