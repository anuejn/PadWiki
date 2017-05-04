var state = null
window.onload = function () {
  // the main editing handler
  document.getElementsByTagName('aside')[0].onclick = function (event) {
    var nodeName = event.target.nodeName
    var parentNodeName = event.target.parentNode.nodeName
    var padId = event.target.getAttribute('data-pad-id');
    if(!padId) {
      padId = event.target.parentNode.getAttribute('data-pad-id');
    }

    // open pad
    if (nodeName == 'LI') {
      showPad(padId);
    }

    // handle pad edit actions
    if (parentNodeName == 'LI') {
      if (nodeName == 'EDIT') {
        var newTitle = prompt('New Pad Title:', getTitleByPadId(padId));
        if (newTitle) {
          setTitleByPadId(padId, newTitle);
          socket.emit('wiki.update', state)
        }
      } else if (nodeName == 'ADD') {
        var newTitle = prompt('New Pad Title:', '');
        if (newTitle) {
          addChildToPad(padId, newTitle);
          socket.emit('wiki.update', state)
        }
      } else if (nodeName == 'REMOVE') {
        if (window.confirm('Do you really want to delete the pad "' + getTitleByPadId(padId) + '"') == true) {
          removePad(padId);
          socket.emit('wiki.update', state)
        }
      }
    }

    // edit title
    if (nodeName == 'EDIT' && parentNodeName == 'H1') {
      var newTitle = prompt('New Wiki Title:', state.title)
      if (newTitle) {
        state.title = newTitle
        socket.emit('wiki.update', state)
      }
    }
  }

  document.getElementById('search').oninput = function() {
    search_state = state.splice();
    
  }

  // setup all the socketio stuff...
  socket = io()
  socket.on('wiki.update:' + getWikiId(), function (updateEvent) {
    setTitle(updateEvent.title)
    setpads(updateEvent.pads)
    if (state == null) {
      showPad(updateEvent.pads[0].id)
      firstUpdate = false
    }
    state = updateEvent
  })

  // really join the wiki
  socket.emit('wiki.join', getWikiId())
}

function setpadsHTML (padsHTML) {
  document.getElementsByTagName('ul')[0].outerHTML = padsHTML
}

function setpads (padsList) {
  setpadsHTML(padsToHtml(padsList))
}

function padsToHtml (padsList, isRecursion) {
  var html = '<ul>'
  padsList.forEach(function (pad) {
    html += '<li data-pad-id="' + pad.id + '">' + pad.title + '<add></add><remove></remove><edit></edit></li>'
    if (pad.sub) {
      html += padsToHtml(pad.sub, true)
    }
  })
  if(!isRecursion) {
    html += '<li class="add" data-pad-id="add"><add></add></li>';
  }
  html += '</ul>'
  return html
}

function getTitleByPadId(padId, padsList) {
  if(!padsList) {
    padsList = state.pads;
  }

  var res = false;
  padsList.forEach(function(pad) {
    if(pad.id == padId) {
      res = pad.title;
    } else if(pad.sub) {
      var title = getTitleByPadId(padId, pad.sub);
      if(title) {
        res = title;
      }
    }
  });

  return res;
}

function setTitleByPadId(padId, title, padsList) {
  if(!padsList) {
    padsList = state.pads;
  }

  padsList.forEach(function(pad) {
    if(pad.id == padId) {
      pad.title = title;
    } else if(pad.sub) {
      setTitleByPadId(padId, title, pad.sub);
    }
  });
}

function addChildToPad(padId, padName, padsList) {
  if(!padsList) {
    padsList = state.pads;
  }

  if(padId == 'add') {
      padsList.push({'title': padName, 'id': encodeURIComponent(padName)});
      return;
  }

  padsList.forEach(function(pad) {
    if(pad.id == padId) {
      if(!pad.sub) {
        pad.sub = [];
      }
      pad.sub.push({'title': padName, 'id': encodeURIComponent(padName)});
    } else if(pad.sub) {
      addChildToPad(padId, padName, pad.sub);
    }
  });
}

function removePad(padId, padsList) {
  if(!padsList) {
    padsList = state.pads;
  }

  padsList.forEach(function(pad) {
    if(pad.id == padId) {
      padsList.splice(padsList.indexOf(pad), 1);
    } else if(pad.sub) {
      removePad(padId, pad.sub);
    }
  });

}

function search(string, padsList) {
  if(!padsList) {
    padsList = state.pads;
  }

  padsList.forEach(function(pad) {
    if(pad.title.toLocaleLowerCase().indexOf(string) != -1) {
      padsList.splice(padsList.indexOf(pad), 1);
    } else if(pad.sub) {
      removePad(padId, pad.sub);
    }
  });
}

function getWikiId () {
  return window.location.href.split('/w/')[1].toLocaleLowerCase()
}

function showPad (padId) {
  document.getElementById('pad').setAttribute('src', '/p/' + padId)
}

function setTitle (title) {
  document.getElementById('wiki-title').innerHTML = title + '<edit>'
  document.getElementsByTagName('title')[0].innerHTML = title + ' Wiki'
}
