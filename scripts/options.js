// Contains functions to load and save options from / into storage

//Option Buttons
function load_options(refresh = null) {
    //Get options
    browser.storage.local.get("options-893274923847982").then(function (data) {
        let options = data["options-893274923847982"]
        //If extension is used the first time, set options
        if (!options) {
            save_options()
        } else {
            //Prefill Modal inputs
            $("#options-root-folder").val(options.root_folder)
            $("#options-default-display").val(options.default_display)
            $("#options-sidebar-width").val(options.sidebar_width)
            //Apply changes to site
            $("#folder-section").css("width", options.sidebar_width)
            set_margin(options.sidebar_width)
            $(".display-button").removeClass("active-display")
            $("#display-" + options.default_display).addClass("active-display")
            $("#root_folder_url").text(options.root_folder)

            if (refresh) {
                refresh_ui(null, "folder", true)
            }
        }

    })
}

function save_options(refresh = null) {
    let root_folder = $("#options-root-folder").val().replaceAll(" ", "-")
    let default_display = $("#options-default-display").val()
    let sidebar_width = $("#options-sidebar-width").val()
    //Set default values if inputs are empty
    if (root_folder.length == 0) {
        root_folder = 'root'
    }
    if (default_display.length == 0) {
        default_display = 'details'
    }
    if (sidebar_width.length == 0) {
        sidebar_width = 300
    }
    let data = {}
    data["options-893274923847982"] = { root_folder: root_folder, default_display: default_display, sidebar_width: sidebar_width }
    browser.storage.local.set(data).then(function () {
        load_options(refresh)
    })
}