// Contains all Event Listeners added to the Application

// ####################### EDIT NODE MODAL #######################
// On Node Modal Submit
$("#save-node-button").click(function () {
    let new_url;
    let old_url;
    let clickCount;
    let name;
    let description;
    let type;
    let parent;
    let children;
    let created;
    let tags_val;
    let tags;

    if ($("#input-node-type").val() == "bookmark") {
        old_url = $("#input-node-old-url").val()
        new_url = $("#input-node-url").val()
        clickCount = $("#input-node-clickCount").val()
        name = $("#input-node-title").val()
        description = $("#input-node-description").val()
        type = $("#input-node-type").val()
        parent = $("#input-node-parent").val()
        children = $("#input-node-children").val()
        created = $("#input-node-created").val()

        tags_val = $("#input-node-tags").val().replace(", ", ",").replace(" ,", ",")
        tags = []
        for (let tag of tags_val.split(",")) {
            tags.push(tag)
        }

        /** Necessary because Firefox always adds a backslash to their url.
         * Prevents Double Bookmarks while syncing.
         */
        if (!new_url.endsWith("/")) {
            delete_node(old_url)
            update_or_create_node(old_url + "/", new_url + "/", created, Date.now(), clickCount, tags, name, description, parent, children, type, parent)
        } else {
            update_or_create_node(old_url, new_url, created, Date.now(), clickCount, tags, name, description, parent, children, type, parent)
        }
        // /**Also edit it in Firefox */
        browser.bookmarks.getTree().then(function (data) {
            const ffdata = data[0].children[2]
            editFfNode(ffdata)
            function editFfNode(ffnode) {
                if (ffnode.children) {
                    for (let i = 0; i < ffnode.children.length; i++) {
                        if (ffnode.children[i].title == old_url || ffnode.children[i].url == old_url) {
                            browser.bookmarks.update(ffnode.children[i].id, {
                                title: name,
                                url: new_url
                            });
                        }
                    }

                    /**Necessary to check if child Elements have
                     * been edited
                     */
                    for (child of ffnode.children) {
                        editFfNode(child)
                    }
                }
            }
        })

    }
    else {
        old_url = $("#input-node-old-url").val()
        new_url = $("#input-node-url").val()
        name = $("#input-node-title").val()
        description = $("#input-node-description").val()
        type = $("#input-node-type").val()
        parent = $("#input-node-parent").val()
        children = $("#input-node-children").val()
        created = $("#input-node-created").val()
        tags_val = $("#input-node-tags").val().replace(", ", ",").replace(" ,", ",")
        tags = []
        for (let tag of tags_val.split(",")) {
            tags.push(tag)
        }

        if (parent == "All-4902384039284039284") {
            parent = "root"
        }

        /** If a Folder that was renamed has childs, set
         * the parents properly.
         */
        browser.storage.local.get(null).then(function (dt) {
            let data_arr = Object.keys(dt)
            let nodes = []
            for (let idx = 0; idx < data_arr.length; idx++) {
                let node = dt[data_arr[idx]]
                node.url = data_arr[idx]

                if (node.url == "options-893274923847982") {
                    continue;
                }
                if (node.name == old_url) {
                    if (node.children) {
                        for (child of node.children) {
                            nodes.push(child.url)
                            move_nodes(nodes, name, name)
                        }
                    }
                }
            }

            update_or_create_node(old_url, name, created, Date.now(), 0, tags, name, description, parent, [], type, parent)
        })


        // /**Also edit it in Firefox */
        browser.bookmarks.getTree().then(function (data) {
            const ffdata = data[0].children[2]
            editFfNode(ffdata)
            function editFfNode(ffnode) {
                if (ffnode.children) {
                    for (let i = 0; i < ffnode.children.length; i++) {
                        if (ffnode.children[i].title == old_url || ffnode.children[i].url == old_url) {
                            browser.bookmarks.update(ffnode.children[i].id, {
                                title: name,
                            });
                        }
                    }

                    for (child of ffnode.children) {
                        editFfNode(child)
                    }
                }
            }
        })
    }
    window.location.reload()
});

$("#close-node-button").click(function () {
    $("#input-node-url").val("")
    $("#input-node-old-url").val("")
    $("#input-node-title").val("")
    $("#input-node-description").val("")
    $("#input-node-tags").val("")
    $("#input-node-children").val("")
    $("#edit-form").addClass("hidden")
})

$("#close-settings-button").click(function () {
    window.location.reload()
})

// Launch Add Node Modal
$(document).on('click', '.add-node', function () {
    $("#edit-form").removeClass("hidden")
    //Clear Inputs and autofill Folder
    $("#input-node-url").val("")
    $("#input-node-old-url").val("")
    $("#input-node-title").val("")
    $("#input-node-description").val("")
    $("#input-node-tags").val("")
    $("#input-node-parent").val($('#current_folder_url').text())
    $("#input-node-children").val("")
    $("#input-node-type").val("bookmark")
    $("#input-node-created").val(Date.now())
    $("#input-node-updated").val(Date.now())
    $("#input-node-clickCount").val(0)
    $("#edit-node-modal-label").text("Add Bookmark")
})

//on Add folder button click
$(document).on('click', '.add-folder', function () {
    $("#edit-form").removeClass("hidden")
    $(".input-node-url-row").hide()
    //Clear Inputs and autofill Folder
    $("#input-node-url").val("")
    $("#input-node-old-url").val("")
    $("#input-node-title").val("")
    $("#input-node-description").val("")
    $("#input-node-tags").val("")
    $("#input-node-parent").val($('#current_folder_url').text())
    $("#input-node-children").val("")
    $("#input-node-type").val("folder")
    $("#input-node-created").val(Date.now())
    $("#input-node-updated").val(Date.now())
    $("#input-node-clickCount").val(0)
    $("#edit-node-modal-label").text("Add Folder")
})

// on edit button click
$(document).on('click', '.edit-node', function () {
    let clicked_node_url = $(this).attr("data-url")
    launch_edit_node_modal(clicked_node_url)
})

/**Sets the pressed link to +1 */
$(document).on('click', '.node-link', function () {
    let clicked_node_url = $(this).attr("href")
    clickCounter(clicked_node_url)
})

// launch edit node modal on node right click
$(document).on("contextmenu", ".list-group-item", function (e) {
    e.preventDefault();
    let clicked_node_url = $(this).attr("data-url")
    if (clicked_node_url != "All-4902384039284039284" && clicked_node_url != "Unsorted-4938274923847982347") {
        launch_edit_node_modal(clicked_node_url)
    }
});

//Edit Node modal description logic
$("#description-markdown").click(function () {
    $("#description-markdown").addClass("hidden")
    $("#description-input").removeClass("hidden")
})

//Delete Node
$("#delete-node-button").click(function () {
    delete_node($("#input-node-old-url").val(), true)
    refresh_ui($("#input-node-parent").val(), $("#input-node-type").val())
})


// ####################### TAGS #######################

// Tag Button click
$(document).on('click', '.tag-btn', function () {
    let current_folder = $("#current_folder_url").text()
    //If Tag is already active, deactivate btn and filter
    if ($(this).hasClass("active-tag")) {
        $(".tag-btn").removeClass("active-tag")
        load_bookmarks(current_folder)
        //Else Load bookmarks with filter and activate button
    } else {
        $(".tag-btn").removeClass("active-tag")
        let clicked_tag_url = $(this).attr("data-url")
        $(this).addClass("active-tag")
        let tag = clicked_tag_url.split("-")[1]
        load_bookmarks(current_folder, tag)
    }
})

// Tag/Untag Selected Nodes with Shortcuts
$(document).on("keydown", function (e) {
    if (e.keyCode >= 49 && e.keyCode < 58) {
        let key_pressed = (48 - e.keyCode) * -1
        //Split to get tag name
        if ($("[data-tag-number=" + key_pressed + "]").length > 0) {
            let matching_tag = $("[data-tag-number=" + key_pressed + "]").attr("data-url").split("tag-")[1]
            $('.list-group-item.ui-selected').each(function (i, node) {
                //Refresh page if is last toggle iteration
                if (i == $('.list-group-item.ui-selected').length - 1) {
                    toggle_tag(node.dataset.url, matching_tag, "init")
                } else {
                    toggle_tag(node.dataset.url, matching_tag)
                }
            });
        }
    }
});


// ####################### Folder Sidebar #######################

// Show Bookmarks of selected Folder on click
$(document).on('click', '.folder', function () {
    let clicked_folder = $(this).attr("data-url")
    $(".folder-edit").attr("data-url", clicked_folder)
    load_bookmarks(clicked_folder)
})

//Open Collapse in Sidebar if folder was clicked in bookmark list
$(document).on('click', '.sync-sidebar', function () {
    let clicked_folder = $(this).attr("data-url")
    let collapse = $("#" + clicked_folder + "-collapse")
    if (!collapse.hasClass("show")) {
        new bootstrap.Collapse(collapse, { show: true })
        let collapse_url = collapse.attr("id").replace("-collapse", "")
        $("#arrow-" + collapse_url).css("transform", "rotate(90deg)");
    }
})

// Folder drop Buttons
$(document).on('click', '.drop-button', function () {
    let target_folder = $(this).attr("data-url")
    let cur_folder = $('.list-group-item.ui-selected')
    let nodes = []
    cur_folder.each(function (i, node) {
        nodes.push(node.dataset.url)

        /**Also move it in Firefox */
        browser.bookmarks.getTree().then(function (data) {
            const ffdata = data[0].children[2]
            let target;
            moveFfNode(ffdata)
            function moveFfNode(ffnode) {
                if (ffnode.children) {
                    for (let i = 0; i < ffnode.children.length; i++) {
                        if (ffnode.children[i].title == target_folder) {
                            target = ffnode.children[i].id
                        }
                    }

                    for (let i = 0; i < ffnode.children.length; i++) {
                        if (ffnode.children[i].title == node.dataset.url || ffnode.children[i].url == node.dataset.url) {
                            browser.bookmarks.move(ffnode.children[i].id, { parentId: target });
                        }
                    }

                    for (child of ffnode.children) {
                        moveFfNode(child)
                    }
                }
            }
        })

        if (node.dataset.url === target_folder) {
            alert("Du kannst diesen Ordner nicht in sich selber verschieben.")
        } else {
            move_nodes(nodes, target_folder, target_folder)
        }
    });
    $(this).tooltip('hide');

})

// rotate folder arrows on click
$(document).on('click', '.arrow', function () {
    if ($(this).children("img:first").css("transform") == 'none') {
        $(this).children("img:first").css("transform", "rotate(90deg)");
    } else {
        $(this).children("img:first").css("transform", "");
    }
})

$("#treegraphbutton").click(function () {
    load_treegraph()
})

// ####################### Bookmark List #######################

//List Display Buttons
$(".display-button").click(function () {
    if (!$(this).hasClass("active-display")) {
        $(".display-button").removeClass("active-display")
        $(this).addClass("active-display")
        refresh_ui(null, "bookmark", true)
    }
})

//Sort Button Click
$(".sort-button").click(function () {
    if (!$(this).hasClass("active-display")) {
        $(".sort-button").removeClass("active-sort")
        $(this).addClass("active-sort")
        refresh_ui(null, "bookmark", true)
    }
})

//Delete all Selected Button Click
$("#delete-selected-button").click(function () {
    let changed_node_type = "bookmark"
    $('.list-group-item.ui-selected').each(function (i, node) {
        let dataset = node.dataset.url;
        dataset = dataset.replaceAll("-", " ")

        /**Delete Children if Parent had Children */
        browser.storage.local.get(null).then(function (data) {
            let data_arr = Object.keys(data)
            for (let idx = 0; idx < data_arr.length; idx++) {
                let node = data[data_arr[idx]]
                node.url = data_arr[idx]

                if (node.url == "options-893274923847982") {
                    continue;
                }

                if (node.url == dataset) {
                    deleteChilds(node)
                    function deleteChilds(node) {
                        if (node.children) {
                            for (child of node.children) {
                                delete_node(child.url)
                                deleteChilds(child)
                            }
                        }
                    }
                    delete_node(node.dataset.url)
                }
            }
        })

        /**Also delete it in Firefox */
        browser.bookmarks.getTree().then(function (data) {
            const firefoxobject = data[0].children[2]
            deleteFfNode(firefoxobject)
            function deleteFfNode(ffnode) {
                if (ffnode.children) {
                    for (let i = 0; i < ffnode.children.length; i++) {
                        if (ffnode.children[i].title == dataset || ffnode.children[i].url == dataset) {
                            browser.bookmarks.removeTree(ffnode.children[i].id)
                        }
                    }

                    for (child of ffnode.children) {
                        deleteFfNode(child)
                    }
                }
            }
        })

        //If a folder node is under selection, reload folder sidebar too by passing folder as changed node type
        if (node.classList.contains('folder')) {
            changed_node_type = "folder"
        }
        delete_node(node.dataset.url)
    })
    setTimeout(function () {
        window.location.reload()
    }, 50)
})


// ####################### Search #######################

$("#main-search").on("keydown", function search(e) {
    if (e.keyCode == 13) {
        load_bookmarks("All-4902384039284039284", null, $(this).val())
    }
});

// ####################### Options Modal #######################


//Option Save button
$("#save-options-button").click(function () {
    $('#optionsModal').addClass("hidden")
    $('#bookmark-section').removeClass("hidden")
    save_options(true)
})

$("#settingsbutton").click(function () {
    $('#optionsModal').removeClass("hidden")
    $('#bookmark-section').addClass("hidden")
})

//Export to File
$("#export-file").click(function () {
    let file_type = $("#options-export-type").val()
    if (file_type == "html") {
        export_to_html()
    }
    else if (file_type == "json") {
        export_to_json()
    }
})

//Import from File
$("#import-button").click(function () {
    let file = document.getElementById('import-file').files[0];
    let file_reader = new FileReader();
    file_reader.readAsText(file);
    file_reader.onload = function (e) {
        let file_type = file.name.split(".")[1]
        if (file_type == "html") {
            import_bookmarks_from_html(file_reader.result)
        }
        else if (file_type == "json") {
            import_bookmarks_from_json(file_reader.result)
        }
    };
})

//Options Delete button Click
$('#delete-storage').click(function () {
    var confirmation = confirm("Warning, if you continue all Bookhive + Firefox Bookmarks will be deleted! Continue?")
    if (confirmation) {
        browser.storage.local.clear();
        clearFfNodes()
        window.location.reload()
    } else {
        refresh_ui()
    }

})