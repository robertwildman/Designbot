var restify = require('restify');
var builder = require('botbuilder');

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

//=========================================================
// Bots Dialogs
//=========================================================
// Imports the Google Cloud client library
const Translate = require('@google-cloud/translate');

// Your Google Cloud Platform project ID
const projectId = 'translator-156714';

// Instantiates a client
const translateClient = Translate({
  projectId: projectId,
  keyFilename: 'Translator-131a6896fcd5.json'
}); 


bot.dialog('/', function (session) {
	var text = session.message.text;
    translateClient.detect(session.message.text, function(err, results) {
  	if (!err) {
  		console.log(results);
  		var lan = results.language;
    	//Decacts the code and keeps if its not the user lanagues
    	if(results.language != 'en')
    	{
			translateClient.translate(session.message.text, 'en').then((results) => {
   			const translation = results[0];
   			session.send(translation + ' translated from ' + lan);  });
    	}
  	}
  	else
  	{
  		console.log(err);
    	session.send(err);
  	}
	});
});

