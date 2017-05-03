/*
 * the express server hook
*/

express = require("express");
var path = require('path');

exports.expressCreateServer = function (hook_name, args, cb) {
  // serve the html for the /w/ wikis
  args.app.get('/w/*', function (req, res) {
    res.sendFile(path.resolve(__dirname + '/../static/wiki/wiki.html'));
  })

  // serve the static files under /static/wiki/
  args.app.use("/static_wiki/", express.static(__dirname + "/../static/wiki/"))
}
