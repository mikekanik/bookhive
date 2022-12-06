function load_folders(initial = null) {
    var nodeCount = 0;
    clear_folders()
    browser.storage.local.get(null).then(function (data) {
        let data_arr = Object.keys(data)
        let folders = []
        let nodes = []
        for (let idx = 0; idx < data_arr.length; idx++) {
            let node = data[data_arr[idx]]
            if (node.url == "options-893274923847982") {
                continue;
            }

            if (node.type == 'folder') {
                //Add Folder URL to node so we can use it later
                node.url = data_arr[idx]
                //Ignore Option Storage Object

                if (node.parent == "Weitere-Lesezeichen") {
                    node.parent = "root"
                }

                folders.push(node)
            }
            nodes.push(node)
            nodeCount++;

        }

        //Append All and Unsorted Folders, since they are not really existing as nodes in Storage
        $("#folder-list").append("<li id='folder-All-4902384039284039284' data-url='All-4902384039284039284' class='list-group-item list-group-item-white d-flex align-items-center folder lihover mt-1'><span style='margin-left: 14px'>All Bookmarks</span><span class='badge badgeview' style='margin-left: 3px'> (" + nodeCount + ")</span>")

        function render_folder(folder, level) {
            let nodeChildren = 0;
            let childnodes = nodes.filter(childnode => childnode.parent == folder.url)
            for (let child of childnodes) {
                nodeChildren++;
            }

            let dropbt = "<button data-url='" + folder.url + "' style='right: 0; position: absolute; width: 50px' class='btn btn-light drop-button selection-show hidden shadow' data-bs-toggle='tooltip' title='Move selected to this Folder'><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16px\" height=\"16px\" class=\"h-5 w-5\" viewBox=\"0 0 20 20\" fill=\"currentColor\">\n" +
                "  <path fill-rule=\"evenodd\" d=\"M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z\" clip-rule=\"evenodd\" />\n" +
                "</svg></button>"

            let icon = "<svg style='margin-right: 10px' xmlns=\"http://www.w3.org/2000/svg\" width=\"16px\" height=\"16px\" class=\"h-5 w-5\" viewBox=\"0 0 20 20\" fill=\"#d6b52f\">\n" +
                "  <path d=\"M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z\" />\n" +
                "</svg>"
            let li = "    " +
                "<li data-url='" + folder.url + "' id='folder-" + folder.url + "' class='list-group-item list-group-item-white justify-content-between p-0 lihover droppable'>\n" +
                "        <div class=\"row\">\n" +
                "            <div data-bs-toggle='collapse' data-bs-target='#" + folder.url + "-collapse' class=\"col-1 px-0 ms-3 me-1 arrow\">\n" +
                "                    <img id='arrow-" + folder.url + "' class=\"hidden\" style=\"margin-top: 10px;\" src=\"/icons/arrow-icon-16.png\">\n" +
                "            </div>\n" +
                "            <div data-url='" + folder.url + "' class=\"col mx-0 px-0 py-2 folder sidebar-folder text-left\">\n" +
                "                " + icon + folder.name.substr(0, 21) +
                "       <span class='badge badgeview'> (" + nodeChildren + ")</span>" +
                "            </div>\n" +
                "                " + dropbt + "" +
                "        </div>\n" +
                "    </li>"

            if (level == 0) {
                $("#folder-list").append(li)
            } else {
                $("#" + folder.parent + "-collapse").append(li)
            }

            let folder_li = $("[id='folder-" + folder.url + "']")
            folder_li.after("<div id='" + folder.url + "-collapse' class='collapse'></div>");
            folder_li.attr("style", "margin-left: " + level * 20 + "px")

            let child_nodes = folders.filter(child_node => child_node.parent == folder.url)
            if (child_nodes.length > 0) {
                $("#arrow-" + folder.url).removeClass("hidden")
                for (let child of child_nodes) {
                    render_folder(child, level + 1)
                }
            }
        }

        for (let root of folders.filter(root_node => root_node.parent.includes($("#options-root-folder").val()))) {
            render_folder(root, 0)
        }

        //Open Sub Folder collapses in sidebar if initial is set
        if (initial) {
            let cur_collapse = $("#" + initial + "-collapse")
            while (cur_collapse.hasClass("collapse")) {
                new bootstrap.Collapse(cur_collapse, { show: true })
                let collapse_url = cur_collapse.attr("id").replace("-collapse", "")
                $("#arrow-" + collapse_url).css("transform", "rotate(180deg)");
                cur_collapse = cur_collapse.parent()
            }
        }
    })
    $("#edit-current-folder-button").removeClass("hidden")
}
