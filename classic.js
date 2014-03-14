// Build the HTML for the Bookmarks container
function bmContainerHtml(bar_node, oth_node) {
    var html = '<ul>';
    var child_html = '';
    
    for(var i = 0; i < bar_node.children.length; i++) {
        child_html = child_html + bookmarksHtml(bar_node.children[i]);
    }
    
    html = html + child_html;
    html = html + bookmarksHtml(oth_node);
    
    html = html + '</ul>';
    
    return html;
}

// Build the HTML for bookmark folders and items
function bookmarksHtml(bm_node) {
    var html = '';
    var platform = (navigator.platform.indexOf('Mac') == 0) ? ' osx' : '';
    
    if(bm_node.children && bm_node.children.length > 0) {
        html = html + '<li class="group';
        if(bm_node.title == 'Other Bookmarks') {
            html = html + ' other';
        }
        html = html + '"><ul class="folder' + platform + '"><h3>' + bm_node.title + '</h3></label><div>';
        var child_html = '';
        
        for(var i = 0; i < bm_node.children.length; i++) {
            child_html = child_html + bookmarksHtml(bm_node.children[i]);
        }
        
        html = html + child_html + '</div></ul></li>';
    } else if(bm_node.url) {
        html = html + '<li';
        if(bm_node.url.indexOf('javascript:') != 0) {
            html = html + ' style="background-image: url(chrome://favicon/' + bm_node.url + ');"';
        }
        html = html + '><h4><a href="' + bm_node.url + '">' + bm_node.title + '</a></h4></li>';
    }
    
    return html;
}

// Get the Bookmarks
var bookmarks = chrome.bookmarks.getTree(function(root_node) {
    var bar_node = null;
    var oth_node = null;
    
    for(var i = 0; i < root_node[0].children.length; i++) {
        var leaf = root_node[0].children[i];
        if(leaf.title && leaf.title === 'Bookmarks Bar') {
            bar_node = leaf;
        } else if(leaf.title && leaf.title === 'Other Bookmarks') {
            oth_node = leaf;
        }
    }
    
    var bm_html = bmContainerHtml(bar_node, oth_node);
    document.getElementById('bookmarks').innerHTML = bm_html;
});

// Build the HTML for the Thumbnails container
function thContainerHtml(results) {    
    var MAX_TH = 8;
    var html = '<ul>';
    var inner_html = '';
    
    for(var i = 0; i < MAX_TH; i++) {
        
        if(i < results.length) {
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