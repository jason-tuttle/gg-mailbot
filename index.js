/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  Slack-Bot-Example - A bot for interacting with
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

var Botkit = require('botkit');
var http = require('http');
var url = require('url');
var URI = require("urijs");
var moment = require("moment");
var slackResponse = require("./slack");
var chuck = require("./chuck");
var github = require("./github");
var requestBin = require("./request-bin");
var emails = require("./emails");

var env = require('node-env-file');
var fs = require('fs');

var envFile = __dirname + '/.env'
if (fs.existsSync(envFile)) {
  console.log(`Loading variables from ${envFile}`);
  env(envFile);
}

var botOptions = {
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  clientSigningSecret: process.env.CLIENT_SIGNING_SECRET,
  scopes: ['bot'],
  debug: process.env.DEBUG || false
};

if (process.env.REDIS_URL) {
  var redisURL = url.parse(process.env.REDIS_URL);
  botOptions.storage = redis({
    namespace: 'botkit-indy-tech-talks',
    host: redisURL.hostname,
    port: redisURL.port,
    auth_pass: redisURL.auth ? redisURL.auth.split(":")[1] : null
  });
} else {
  botOptions.json_file_store = __dirname + '/.data/db/'; // store user data in a simple JSON format
}

if (!process.env.BOT_TOKEN) {
  console.log('Error: Specify BOT_TOKEN in environment');
  process.exit(1);
}

var controller = Botkit.slackbot(botOptions);

var bot = controller.spawn({
  debug: process.env.DEBUG || false,
  token: process.env.BOT_TOKEN
}).startRTM(function(err) {
  if (err) {
    throw new Error(err);
  }
});

// we ALSO need a built in webserver for the slash commands
controller.setupWebserver(process.env.PORT,function(err,webserver) {
  controller.createWebhookEndpoints(controller.webserver);
  controller.createOauthEndpoints(controller.webserver, function(err, req, res) {
    if (err) {
      res.status(500).send('ERROR: ' + err);
    } else {
      res.send('Success!');
    }
  });
});

controller.hears(['did you hear'], 'direct_message', function(bot, message) {
  bot.reply(message, 'I heard you!')
  bot.startConversation(message, function(err, convo) {
    convo.say('Taking this private...');
  });
});

controller.hears(['^tell me a secret$'], ['direct_mention', 'ambient', 'mention'], function(bot, message) {
  bot.startConversation(message, function(err, convo) {
    convo.say('Better take this private...')
    convo.say({ ephemeral: true, text: 'These violent delights have violent ends' })
  });
});

// listen for slash commands and respond with relevant data
controller.on('slash_command', function (bot, message) {
  function cleanMessage(text) {
    return text.replace(/[^0-9]/gi, "");
  }

  console.log("received slack_command", message);

  function initialResponse(results) {
    if (results.length) {

    }
  }

  function botResponse(attachments) {
    // ensure we're working with an array
    if (!Array.isArray(attachments)) {
      attachments = [attachments];
    }
    bot.replyPublicDelayed(message, {
      text: "Here's what I found...",
      attachments: attachments,
    }, function(err,resp) {
      console.log(err,resp);
    });
  }

  switch (message.command) {
    case '/getthemail':
      // bot.replyAcknowledge();
      bot.replyPrivate(message, "Working on that...");
      let [user, time] = message.text.split(/\s+/);

      // botResponse(emails.find(message.text));
      emails.replyDialog(bot, message, {user, time});
      break;
    case '/github':
      bot.replyPrivate(message, "Working on it");
      let [type, name] = message.text.split(/\s+/);

      github.getUser(type, name).then(user => {
        if (user.message && user.message == 'Not Found') {
          bot.replyPrivateDelayed(message, {text: "These are not the droids you are looking for"});
        } else {
          botResponse(slackResponse.buildGithubUserResponse(user));
        }
      });
      break;
    case '/bug':
      slackResponse.replyBugDialog(bot, message, {title: message.text});
      break;
  }
});

controller.on('dialog_submission', function(bot, message) {
  bot.dialogOk();
  console.log("##### dialog submission:", message);
  
  bot.whisper(message, 'Hang on, I\'m not quite there yet.');
});
