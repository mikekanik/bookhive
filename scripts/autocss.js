//Auto CSS
function set_margin(sidebar_width) {
    let margin = parseInt(sidebar_width) + 40
    $("#bookmark-section").css("margin-left", margin + "px")
    $("options-sidebar-width").val(sidebar_width)
}

const Observer = new ResizeObserver(entries => {
    entries.forEach(entry => {
        set_margin(entry.contentRect.width)
    });
});

function set_editmargin(sidebar_width) {
    let margin = parseInt(sidebar_width) + 350
    $("#bookmark-section").css("margin-left", margin + "px")
    $("options-sidebar-width").val(sidebar_width)
}
const EditObserver = new ResizeObserver(entries => {
    entries.forEach(entry => {
        set_editmargin(entry.contentRect.width)
    })
})

const folder_section = document.querySelector('#folder-section');
Observer.observe(folder_section);

const edit_section = document.querySelector('#edit-form');
EditObserver.observe(edit_section)