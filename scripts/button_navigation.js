/**Navigate through Folderlist with Arrowkeys 
 * https://stackoverflow.com/questions/8902787/navigate-through-list-using-arrow-keys-javascript-jq - Falselight
*/
var ul = document.getElementById('folder-list');
var liSelected;
var index = -1;

document.addEventListener('keydown', function (event) {
    var len = ul.getElementsByTagName('li').length - 1;

    // DOWN ARROW 
    if (event.which === 40) {
        index++;

        if (liSelected) {
            removeClass(liSelected, 'selected');
            next = ul.getElementsByTagName('li')[index];

            if (typeof next !== undefined && index <= len) {
                liSelected = next;
            }
            else {
                index = 0;
                liSelected = ul.getElementsByTagName('li')[0];
            }

            addClass(liSelected, 'selected');
        }
        else {
            index = 0;
            liSelected = ul.getElementsByTagName('li')[0];
            addClass(liSelected, 'selected');
        }
    }
    // UP ARROW
    else if (event.which === 38) {
        if (liSelected) {
            removeClass(liSelected, 'selected');
            index--;
            next = ul.getElementsByTagName('li')[index];

            if (typeof next !== undefined && index >= 0) {
                liSelected = next;
            }
            else {
                index = len;
                liSelected = ul.getElementsByTagName('li')[len];
            }

            addClass(liSelected, 'selected');
        }
        else {
            index = 0;
            liSelected = ul.getElementsByTagName('li')[len];
            addClass(liSelected, 'selected');
        }
    }

    else if (event.which === 13) {
        if (liSelected) {
            load_bookmarks(liSelected.dataset.url)
            /**Necessary so Folder Collapse opens on Sidebar */
            const child = liSelected.children[0].children[0]
            $(child).trigger('click')
        }
    }
}, false);

function removeClass(el, className) {
    if (el.classList) {
        el.classList.remove(className);
    } else {
        el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    }
};

function addClass(el, className) {
    if (el.classList) {
        el.classList.add(className);
    } else {
        el.className += ' ' + className;
    }
};