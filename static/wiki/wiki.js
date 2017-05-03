

var state = null;
var firstUpdate = true;
window.onload = function() {
    // the main editing handler
    document.getElementsByTagName("aside")[0].onclick = function(event) {
        if(event.target.nodeName == "EDIT") {
            // edit title
            if(event.target.parentNode.nodeName == "H1") {
                var newTitle = prompt("New Title:", state.title);
                if(newTitle) {
                    state.title = newTitle;
                    socket.emit('wiki.update', state);
                }
            }
        }
    }

    // setup all the socketio stuff...
    socket = io();
    socket.on('wiki.update:' + getWikiId(), function (updateEvent) {
        setTitle(updateEvent.title);
        setPages(updateEvent.pages);
        if(firstUpdate) {
            viewPad(updateEvent.pages[0].padId);
            firstUpdate = false;
        }
        state = updateEvent;
    });

    // really join the wiki
    socket.emit('wiki.join', getWikiId());
}

function setPagesHTML(pagesHTML) {
    document.getElementsByTagName("ul")[0].outerHTML = pagesHTML;
}

function setPages(pagesList) {
    setPagesHTML(pagesToHtml(pagesList));
}

function pagesToHtml(pagesList) {
    var html = "<ul>";
    pagesList.forEach(function(page) {
        html += '<li><a target="pad" href="/p/' + page.padId + '">' + page.title + '</a></li>';
        if(page.sub) {
            html += pagesToHtml(page.sub);
        }
    });
    html += "</ul>";
    return html;
}


function getWikiId() {
    return window.location.href.split("/w/")[1].toLocaleLowerCase();
}

function viewPad(padId) {
    document.getElementById('pad').setAttribute("src", "/p/" + padId);
}

function setTitle(title) {
    document.getElementById("wiki-title").innerHTML = title + '<edit>';
    document.getElementsByTagName("title")[0].innerHTML = title + ' Wiki';
}