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
var connector2 = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);
var bot1 = new builder.UniversalBot(connector2);
server.post('/api/messages', connector.listen());
server.get('/api/messages', connector2.listen());

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
bot1.dialog('/',function(session) {
	session.send('Hello');
})

bot.dialog('/', function (session) {
	var userlan = session.userData.Language;
	var text = session.message.text;
	 if (!session.userData.Language || text == 'edit lang') {
            session.beginDialog('/profile');
      } else {
    	translateClient.detect(session.message.text, function(err, results) {
  			if (!err) {
  			console.log(results);
  			var lan = results.language;
    		//Decacts the code and keeps if its not the user lanagues
    		if(results.language != userlan)
    		{
				translateClient.translate(session.message.text, userlan).then((results) => {
   				const translation = results[0];
   				session.send(translation + ' translated from ' + lan);
   				});
    		}
  			else
  			{
  				console.log(err);
    			session.send(err);
  			}
  			}
     	});
    }
   });

bot.dialog('/profile', [
    function (session) {
        builder.Prompts.text(session, 'Please select your language; (en / es / fr / de / pt)');
    },
    function (session, results) {
        session.userData.Language = results.response;
        session.send('Language is now ' + results.response); 
        session.endDialog();
    }
]);

