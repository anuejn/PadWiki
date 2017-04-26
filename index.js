// the express server hook 
exports.expressCreateServer = function (hook_name, args, cb) {
  args.app.get('/w/*', function(req, res) {
    res.sendFile(__dirname + "/static/wiki/wiki_main.html");
  });
}

// handle the socketio traffic for the sidebar
exports.socketio = function() {

}