window.onload = () => {
    // setup all the socketio stuff...
    socket = io();
    socket.on('wiki.update:' + getWikiId(), function (updateEvent) {
        setTitle(updateEvent.title);
        setPages(updateEvent.pages);
        viewPad(updateEvent.pages[0].padId);
    });

    // really join the wiki
    socket.emit('wiki.join', getWikiId());
}

function setPagesHTML(pagesHTML) {
    document.getElementById("pages").outerHTML = pagesHTML;
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
    document.getElementById("wiki-title").innerHTML = title;
    document.getElementsByTagName("title")[0].innerHTML = title + ' Wiki <img src="/static_wiki/icons/pencil.svg" style="padding-left: 10px;height: inherit;">';
}