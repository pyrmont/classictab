// Build the HTML for the Bookmarks container
function bmContainerHtml(bar_node, oth_node) {
    var html = (navigator.platform.indexOf('Mac') == 0) ? '<ul class="osx">' : '<ul>';
    var child_html = '';
    
    for (var i = 0; i < bar_node.children.length; i++) {
        child_html = child_html + bookmarksHtml(bar_node.children[i], 0);
    }
    
    html = html + child_html;
    html = html + bookmarksHtml(oth_node, 0);
    
    html = html + '</ul>';
    
    return html;
}

// Build the HTML for bookmark folders and items
function bookmarksHtml(bm_node, depth) {
    var html = '';
    
    if (bm_node.children) {
        html = html + '<li class="group l_' + depth + '';
        if (bm_node.title == 'Other Bookmarks') {
            html = html + ' other';
        }
        html = html + '"><ul class="folder"><h3>' + bm_node.title + '</h3></label><div>';
        var child_html = '';
        
        if (bm_node.children.length == 0) {
            child_html = child_html + '<li class="empty"><h4>(empty)</h4></li>';
        } else {
            for (var i = 0; i < bm_node.children.length; i++) {
                child_html = child_html + bookmarksHtml(bm_node.children[i], depth + 1);
            }
        }
        
        html = html + child_html + '</div></ul></li>';
    } else if (bm_node.url) {
        html = html + '<a href="' + bm_node.url + '"><li';
        if (bm_node.url.indexOf('javascript:') != 0) {
            html = html + ' style="background-image: url(chrome://favicon/' + bm_node.url + ');"';
        }
        html = html + '><h4>' + bm_node.title + '</h4></li></a>';
    }
    
    return html;
}

// Position the menu
function positionMenu(e) {
    e.stopPropagation();

    if(e.type == 'click' && this.className && this.className.indexOf('clicked') != -1) {
        this.className = this.className.replace(/\b clicked\b/, '');
        clearMenus(this);
        return;
    }
    
    var child = this.getElementsByTagName('div')[0];
    
    if (this.className.indexOf('l_0') == -1) {
        var vp_width = window.innerWidth;
        var vp_height = window.innerHeight;

        var th_rect = this.getBoundingClientRect();
        var th_width = this.offsetWidth;
        var th_height = this.offsetHeight;
        
        child.style.display = 'block';
        var ch_rect = child.getBoundingClientRect();
        var ch_width = child.offsetWidth;
        var ch_height = child.offsetHeight;
        child.style.display = '';        
        
        if (th_rect.right + ch_width < vp_width || th_rect.left - ch_width <= 0) { 
            child.style.left = th_width + 33 + 'px'; // TODO: Why is 33 a magic number?
        } else if (th_rect.left - ch_width > 0) {
            child.style.right = th_width + 6 + 'px'; // TODO: Why is 6px a magic number?
        }
        
        if (th_rect.top + ch_height > vp_height) {
            child.style.marginTop = (vp_height - (th_rect.top + ch_height + 33)) + 'px'; // TODO: Why is 33 a magic number?
        }
    }
    
    var siblings = this.parentNode.childNodes;
    
    for (var i = 0; i < siblings.length; i++) {
        if (siblings[i] != this && siblings[i].className && siblings[i].className.indexOf('clicked') != -1) {
            siblings[i].className = siblings[i].className.replace(/\b clicked\b/, '');
            clearMenus(siblings[i]);
        }
    }
    
    if (this.className.indexOf('clicked') == -1) {
        this.className = this.className + ' clicked';
    }
}

// Clear all below a certain node.
function clearMenus(node) {
    var menus = node.getElementsByClassName('clicked'); // This is a NodeList object so need to convert to array.
    var els = [];
    
    for (var i = 0; i < menus.length; i++) {
        els[i] = menus[i];
    }
    
    for (var i = 0; i < els.length; i++) {
        els[i].className = els[i].className.replace(/\b clicked\b/, '');
    }
}

// Get the Bookmarks
var bookmarks = chrome.bookmarks.getTree(function(root_node) {
    var bm_el = document.getElementById('bookmarks');
    var bar_node = null;
    var oth_node = null;
    
    for (var i = 0; i < root_node[0].children.length; i++) {
        var leaf = root_node[0].children[i];
        if (leaf.title && leaf.title === 'Bookmarks Bar') {
            bar_node = leaf;
        } else if (leaf.title && leaf.title === 'Other Bookmarks') { // TODO: What if there is a user-created folder called 'Other Bookmarks'?
            oth_node = leaf;
        }
    }
    
    var bm_html = bmContainerHtml(bar_node, oth_node);    
    bm_el.innerHTML = bm_html;
    
    var li_els = bm_el.getElementsByClassName('group');
    for (var i = 0; i < li_els.length; i++) {
        li_els[i].addEventListener('click', positionMenu, false);
        if (li_els[i].className.indexOf('l_0') == -1) {
            li_els[i].addEventListener('mouseover', positionMenu, false);
        }
    }
    
    document.addEventListener('click', function(e) { 
        e.stopPropagation();
        clearMenus(document);
    }, false);
});

// Build the HTML for the Thumbnails container
function thContainerHtml(results) {    
    var MAX_TH = 8;
    var html = '<ul>';
    var inner_html = '';
    
    for (var i = 0; i < MAX_TH; i++) {
        
        if (i < results.length) {
            inner_html = inner_html + '<li><a href="' + results[i].url + '"><img src="images/transparent.png" class="thumb" /><h3><img src="chrome://favicon/' + results[i].url + '" class="favicon" />' + results[i].title + '</h3></a></li>';
        } else {
            inner_html = inner_html + '<li><img src="images/transparent.png" /></li>';
        }
    }
    
    html = html + inner_html + '</ul>';
    
    return html;
}

// Get the Thumbnails
var thumbnails = chrome.topSites.get(function(results) {
    var th_html = thContainerHtml(results);
    document.getElementById('thumbnails').innerHTML = th_html;
});