/*
 * handle the socketio traffic for the sidebar
*/

var crypto = require('crypto')

exports.socketio = function (hook_name, args, cb) {
  // init the socketio stuff
  var io = args.io

  // init the db
  var db = require('ep_etherpad-lite/node/db/DB').db

  // handle clients
  io.sockets.on('connection', function (client) {
    client.on('wiki.join', function (wikiId) {
      var dbKey = 'wiki:' + wikiId

      // send initial data on join
      console.log('someone joined the wiki with id: ' + wikiId)
      db.get(dbKey, function (err, value) {
        if (!value) {
          value = {'title': wikiId, 'pages': [
              {'title': 'Home', 'padId': crypto.createHash('md5').update(wikiId).digest('hex')}
            ]
          }
        }
        client.emit('wiki.update:' + wikiId, value)
      });

      // write updates to db and publish them
      client.on('wiki.update', function (updateEvent) {
        db.set(dbKey, updateEvent)
        io.sockets.emit('wiki.update:' + wikiId, updateEvent)
      })
    })
  })
}
