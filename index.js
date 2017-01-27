var restify = require('restify');
var builder = require('botbuilder');
var calling = require('botbuilder-calling');
var fs = require('fs');

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3987, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

// Create calling bot
var callconnector = new calling.CallConnector({
    callbackUrl: 'https://53d0230a.ngrok.io/api/calls',
    appId: 'e2bdeafb-c196-40ef-84c1-7105af4ba7ba',
    appPassword: 'QkhEa1j5M9vig6Lyudd9pke'
});
//Making the callbot
var callbot = new calling.UniversalCallBot(callconnector);
server.post('/api/calls', callconnector.listen());


//=========================================================
// Bots Dialogs
//=========================================================
// Imports the Google Cloud client library
const Translate = require('@google-cloud/translate');
const Speech = require('@google-cloud/speech');
// Your Google Cloud Platform project ID
const projectId = 'translator-156714';

// Instantiates a client
const speechClient = Speech({
  projectId: projectId,
  keyFilename: 'Translator-131a6896fcd5.json'
});


// Instantiates a client
const translateClient = Translate({
  projectId: projectId,
  keyFilename: 'Translator-131a6896fcd5.json'
}); 

// Add root dialog
callbot.dialog('/', [
    function (session) {
    	console.log(`1`);
    	session.send("This is a intro ");
        calling.Prompts.record(session,"Leave Message after beep", { playBeep: true,recordingFormat: 'wav',maxDurationInSeconds:20 });
    },
    function (session, results) {
    	console.log(`1`);
        if (results.response) {
        	console.log(`1`);
        	//To save to the file.
        	fs.writeFile("test.wav", results.response, function(err) {
			    if(err) {
			      console.log("err", err);
			    } else {
			      console.log(`1`);
        	 const config = {
			    // Configure these settings based on the audio you're transcribing
			    encoding: 'LINEAR16',
			    sampleRate: 16000
			  };
  			// Detects speech in the audio file, e.g. "./resources/audio.raw"
  			// Sends it off to the speechclient
 		 return speechClient.recognize('test.wav', config)
    		.then((results) => {

		      const transcription = results[0];
		      session.send(transcription);
		      console.log(`Transcription: ${transcription}`);
		      return transcription;
		      console.log(`1`);
    		});
    		console.log(`1`);
            session.endDialog(results.response.lengthOfRecordingInSecs);
			    }
			  }) 
        	
        } else {
        	console.log(`1`);
            session.endDialog('failed');
        }
    }
]);

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

