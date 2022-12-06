function load_bookmarks(folder = "All-4902384039284039284", tag = null, search_filter = null) {
    clear_bookmarks()
    //Get Active Tag
    let active_tags = $(".tag-btns").find(".active-tag")
    if (active_tags.length > 0) {
        tag = active_tags[0].id.split("-")[1]
    }

    browser.storage.local.get(null).then(function (data) {
        let data_arr = Object.keys(data)
        let tags = []
        let nodes = []
        for (let idx = 0; idx < data_arr.length; idx++) {
            let node = data[data_arr[idx]]
            node.url = data_arr[idx]

            //Ignore Option Storage Object
            if (node.url == "options-893274923847982") {
                continue;
            }

            if (node.parent == "Weitere-Lesezeichen") {
                node.parent = "root"
            }    

            //Gather Tags
            if (node.tags) {
                for (let cur_tag of node.tags) {
                    if (cur_tag != "") {
                        tags.push(cur_tag)
                    }
                }
            }

            //Filter Folder
            if (node.parent != folder && folder != "All-4902384039284039284") {
                continue;
            }

            /**Display results based on if a Tag is selected or not */
            if (tag) {
                if (!node.tags || !node.tags.includes(tag)) {
                    continue;
                }
            }

            //Filter Search
            if (search_filter) {
                //Make search value lowercase so case doesnt matter
                search_filter = search_filter.toLowerCase()
                // if keyword is neither in title nor in description nor in url
                if (!node.name.toLowerCase().includes(search_filter) && !node.description.toLowerCase().includes(search_filter) && !node.url.toLowerCase().includes(search_filter)) {
                    // and if keyword is NOT in any of the node tags, skip node and dont render it
                    if (node.tags) {
                        let matching_tag = false
                        for (let cur_tag of node.tags) {
                            if (cur_tag.toLowerCase().includes(search_filter)) {
                                matching_tag = true
                            }
                        }
                        if (!matching_tag) {
                            continue
                        }
                    } else {
                        continue;
                    }
                }
            }

            nodes.push(node)
        }
        /** Check if Folders have children */
        let root_nodes = nodes.filter(node => node.parent == "root" || node.parent == "Weitere-Lesezeichen")

        function getChildNodes(node) {
            let child_nodes = nodes.filter(child_node => child_node.parent == node.url)
            for (let child of child_nodes) {
                node.children = child_nodes;
                getChildNodes(child)
            }
        }

        for (let root_node of root_nodes) {
            getChildNodes(root_node)
        }

        //Get active Sort method
        let active_sort = $(".active-sort").attr("id").split("sort-")[1]

        //Sort nodes by active sort choice
        nodes.sort(function (a, b) {
            switch (active_sort) {
                case "letter":
                    return a.name > b.name
                case "letter-reverse":
                    return a.name < b.name
                case "created":
                    return a.created > b.created
                case "created-reverse":
                    return a.created < b.created
                case "updated":
                    return a.updated > b.updated
                case "updated-reverse":
                    return a.updated < b.updated
                case "clicked":
                    return a.clickCount > b.clickCount
                case "clicked-reverse":
                    return a.clickCount < b.clickCount
                default:
                    return a.name > b.name
            }
        });

        //Limit Nodes to max of 200
        nodes = nodes.slice(0, 200)
        for (let node of nodes) {
            let url = node.url
            //Render Nodes
            if (node.type == "bookmark") {
                // Render Bookmark
                let favicon = "<img style='margin-right: 10px' src='https://s2.googleusercontent.com/s2/favicons?domain_url=" + url + "'>"
                let link = "<a target='_blank' class='node-link' href='" + url + "'>" + node.name.substr(0, 200) + "</a>"
                let editbt = "<button data-url='" + url + "' style='float: right; padding: 0' type='button' class='mx-3 px-2 btn btn-outline-secondary edit-node bookmark-edit'><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16px\" height=\"16px\" class=\"h-6 w-6\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\" stroke-width=\"2\">\n" +
                    "  <path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z\" />\n" +
                    "</svg></button>"

                let tags = ''

                //If Detail View is active, show details
                if ($("#display-details").hasClass("active-display")) {
                    tags += "<br>"
                    let stripped_url = url.replace("https://", "").replace("http://", "").replace("www.", "").split("/")[0]
                    tags += "" + stripped_url + ""

                    tags += "<span class='dot ms-2 me-1'></span>"
                    tags += new Date(node.created).toLocaleDateString()

                    tags += "<span class='dot ms-2 me-1'></span>"
                    tags += node.clickCount + "x Besucht"

                    if (node.tags.length > 0) {
                        tags += "<span class='dot ms-2 me-1'></span>"
                    }
                    for (let cur_tag of node.tags) {
                        tags += "<span class='ms-1 badge rounded-pill bg-secondary'>" + cur_tag + "</span>"
                    }

                }

                $('#bookmark-list').append("<li data-url='" + url + "' class='list-group-item bookmark draggable ui-draggable'>" + favicon + link + tags + editbt + "</li>")
            } else if (node.type == "folder") {
                // Render Folder
                let favicon = "<svg style='margin-right: 10px' xmlns=\"http://www.w3.org/2000/svg\" width=\"16px\" height=\"16px\" class=\"h-5 w-5\" viewBox=\"0 0 20 20\" fill=\"#d6b52f\">\n" +
                    "  <path d=\"M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z\" />\n" +
                    "</svg>"
                let link = "<a>" + node.name + "</a>"
                $('#bookmark-list').prepend("<li id='node-" + url + "' data-url='" + url + "' class='list-group-item lihover droppable folder sync-sidebar'>" + favicon + link  + "</li>")
            }

        }

        /** Makes Folders selectable if they're clicked on */
        $(".selectable").selectable({
            //only make li elements selectees to prevent their childs to be selectable
            filter: "li",
            //cancel select when hovering links and edit buttons to make them clickable
            cancel: "a, .bookmark-edit",
            start: function (event, ui) {
                if ($('.ui-selected').length > 0) {
                    $(".selection-show").removeClass("hidden")
                    $(".droppable").removeClass("lihover")
                } else {
                    $(".selection-show").addClass("hidden")
                    $(".droppable").addClass("lihover")
                }
            },
            stop: function (event, ui, node) {
                if ($('.ui-selected').length > 0) {
                    $(".selection-show").removeClass("hidden")
                    $(".droppable").removeClass("lihover")
                } else {
                    $(".selection-show").addClass("hidden")
                    $(".droppable").addClass("lihover")
                }
            }
        });

        //After Everything is loaded, load tag btns
        //https://stackoverflow.com/questions/1960473/get-all-unique-values-in-a-javascript-array-remove-duplicates
        $(".tag-btn").remove()
        //Use ES6 Set and spread operator to distinct list instead of checking list every iteration above for more performance
        let distinct_tags = [...new Set(tags)]
        let idx = 1
        for (let cur_tag of distinct_tags) {
            let tag_btn = "<button id='tag-" + cur_tag + "' data-tag-number='" + idx + "' data-url='tag-" + cur_tag + "' class='btn btn-outline-secondary tag-btn'>" + idx + " - " + cur_tag + "</button>"
            $("#tag-btn-group").append(tag_btn)
            idx++;
        }

        //Set Active Tag if there is an active tag
        if (tag) {
            $("[id='tag-" + tag + "']").addClass("active-tag")
        }

        //Hide select folder drop buttons and add hover effect
        $(".selection-show").addClass("hidden")
        $(".droppable").addClass("lihover")

        //Set Page Title and active Folder
        let current_folder = $("#current_folder_url").text()
        $("#folder-" + current_folder).removeClass("active-folder")
        let sidebar_folder = $("#folder-" + folder)
        sidebar_folder.addClass("active-folder")
        $('#folder-title').text(sidebar_folder.text())
        $("#current_folder_url").text(folder)

        //Hide Current Folder Edit Button if Folder is All or Unsorted
        if (folder == "All-4902384039284039284" || folder == "Unsorted-4938274923847982347") {
            $("#edit-current-folder-button").hide()
        } else {
            $("#edit-current-folder-button").show()
        }

        browser.storage.local.set(data)
    })
    $('#chart').addClass("hidden")
    $('#treechart').addClass("hidden")
    $('#addbookmark').removeClass("hidden")
    $('#addfolder').removeClass("hidden")
    $('#sorts').removeClass("hidden")
    $("#edit-current-folder-button").removeClass("hidden")
}