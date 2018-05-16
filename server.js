var port = 8000,
	express = require('express'),
	app = express();
app.use('/', express.static(__dirname));
app.listen(process.env.PORT || port, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});
console.log('Now serving http://localhost:' + port + '/index.html');