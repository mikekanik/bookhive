/**Clear the Bookmarklist before
 * rendering it
 */
function clear_bookmarks() {
    $("#bookmark-list").empty()
}

/**Clear the Folderlist before
 * rendering it
 */
function clear_folders() {
    $("#folder-list").empty()
}

/**Function to refresh the UI depending on
 * if a Bookmark or Folder was loaded.
 */
function refresh_ui(initial = "All-4902384039284039284", changed_node_type = "folder", stay = false) {
    //if stay is True override initial with current Page
    if (stay) {
        initial = $("#current_folder_url").text()
    }
    //Only refresh folder sidebar when a folder node got changed to increase performance
    if (changed_node_type == "folder") {
        load_folders(initial)
        
    } 
    load_bookmarks(initial)
}

/**Load the Treegraph, also hides every class
 * that isn't related to the Treegraph, like
 * Bookmark List, Add Folder/Bookmark button etc.
 */
function load_treegraph() {
    clear_bookmarks()
    $('#folder-title').text("Graph")
    $('#treechart').removeClass("hidden")
    $('#sorts').addClass("hidden")
    $('#addbookmark').addClass("hidden")
    $('#addfolder').addClass("hidden")
    $('#chart').addClass("hidden")
    $("#addbbookmark").addClass("hidden")
    $("#edit-current-folder-button").addClass("hidden")
}