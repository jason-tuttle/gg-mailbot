var fs = require('fs');
var moment = require('moment');

const baseFilePath = '/var/tmp/emails';

module.exports = {
  list: [],

  findAll: function(user, timespan) {
    const now = Date.now();
    const cutoff = now - (timespan * 1000 * 60);
    console.log(`Now: ${now}, Cutoff: ${cutoff}`);
    let results = [];

    if (!user) {
      return;
    } else {
      var filelist = fs.readdirSync(baseFilePath);
      var filtered = filelist.filter(file => file.startsWith(user) && file.endsWith('.json'));
      var filteredWithData = filtered.map(file => this.buildFileInfo(file));
      results = filteredWithData.filter(file => Date.parse(file.created) >= cutoff);
    }
    return results;
  },

  find: function(user, timespan) {
    const now = Date.now();
    const cutoff = now - (timespan * 1000 * 60);

    if (!user) {
      return;
    } else {
      var filelist = fs.readdirSync(baseFilePath);
      // var file = filelist.filter(item => item.startsWith(user) && item.endsWith('.json'));

      var file = filelist.find(item => item.startsWith(user) && item.endsWith('.json'));
      var data = this.buildFileInfo(file);

      // return filelist.find(item => item.startsWith(user) && item.endsWith('.json'));
      return this.buildFileResponse(data);
    }
  },

  buildFileInfo: function (filename) {
    const fileInfo = fs.statSync(baseFilePath + '/' + filename);
    const file = JSON.parse(fs.readFileSync(baseFilePath + '/' + filename));
    return {
      name: filename,
      id: file.responseId,
      created: fileInfo.birthtime,
      contents: file.json,
    };
  },

  replyDialog: function(bot, message, options = {}) {
    const results = this.findAll(options.user, options.time);

    if (results.length) {
      const selectResults = results.map(result => (
        {
          label: result.contents.Message.Subject.Data,
          value: result.id,
        }
      ));

      var dialog = bot.createDialog(
        'Emails I found:',
        'get_email',
        'View',
      ).addText('User Email', 'email', options.user)
        .addSelect('Email Subject','subject','subject', selectResults);

      bot.replyWithDialog(message, dialog.asObject());
    } else {
      bot.replyPrivateDelayed(message, {text: "Shit, I couldn't find anything."});
    }
  },

  buildFileResponse: function (fileInfo) {
    var attachment = {
      title: 'File Info',
      title_link: 'Link:',
      color: '#31D57C',
      fields: [],
    };

    if (fileInfo.contents) {
      attachment.fields.push({
        title: 'To:',
        value: fileInfo.contents.Destination.ToAddresses.toString(),
      });
      attachment.fields.push({
        title: 'Sent:',
        value: moment(fileInfo.created).calendar(),
      });
      attachment.fields.push({
        title: 'Subject:',
        value: fileInfo.contents.Message.Subject.Data,
      });
    }
    return attachment;
  },

  test: function() {
    if (this.list.length === 0) {
      fs.readFileSync('jokes.txt').toString().split('\n').forEach((line) => {
        this.list.push(line);
      });
    }

    return this.list[Math.floor(Math.random()*this.list.length)];
  }
}
