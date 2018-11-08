# THE MAILMAN
## GG Slack Bot built with BotKit

Service for providing GG Customer Success team member with the ability to retrieve emails from the development server in a self-serve way, freeing up DevOps time resources and providing CS with shorter turnaround time during OQ-PQ.

## Getting Started

* `git clone git@github.com:jason-tuttle/gg-mailbot`
* `cd gg-mailman; npm install`
* Update .env file
* ngrok http `[port]`
* `node index.js` OR `npm run watch` to watch the server for changes

## Prerequisites

* Slack Account with Admin Access
* [BotKit on GitHub](https://github.com/howdyai/botkit)
* [BotKit Slack README](https://botkit.ai/docs/readme-slack.html)
* node and npm
* ngrok (if you want to develop locally)
* Heroku Account (for deployment)

## Create Slack Bot

* Login to your Slack Account
* Create a Slack Application
  * https://api.slack.com/apps
* Create a bot user
  * https://api.slack.com/bot-users
* Update .env Client ID/Secret from App Information and Bot Token

## Mailman sez what?

* responds to a slash command `/getthemail [email] [timespan in minutes]`
  * presents the user with a dialog containing a dropdown of subject headers that match the email address provided, and were created within the time provided by the `timespan` option
---
