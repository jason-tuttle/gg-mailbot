const fs = require('fs');
const moment = require('moment');
const path = require('path');
const HTML5ToPDF = require('html5-to-pdf');

const baseFilePath = '/var/tmp/emails';

const run = async (inputBody, outputFilename) => {
  const html5toPDF = new HTML5ToPDF({
    inputBody: inputBody,
    outputPath: path.join(__dirname, 'tmp', outputFilename),
    renderDelay: 50,
  });

  await html5toPDF.start();
  await html5toPDF.build();
  await html5toPDF.close();
  console.log('Done generating PDF');
  process.exit(0);
};

module.exports = {
  list: [],

  findAll: function(user, timespan) {
    const now = Date.now();
    const cutoff = now - (timespan * 1000 * 60);
    console.log(user, cutoff);
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

  findById: function(user, id) {
    if (!user) {
      return;
    } else {
      var filelist = fs.readdirSync(baseFilePath);
      var filtered = filelist.find(item => item.startsWith(user) && item.endsWith('.json'));
      var filteredWithData = filtered.map(file => this.buildFileInfo(file));
      var foundOne = filteredWithData.find(file => file.id === id);

      return Promise.resolve(foundOne);
    }
  },

  getFileHTML: async function(email, id) {
    const outputFilename = `${email}-${id}`;

    try {
      const file = this.findById(email, id);
      await run(file.content, outputFilename);
      return outputFilename;
    } catch (error) {
      console.warn(error);
      return null;
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
      bot.replyPrivateDelayed(message, {text: "S#!t, I couldn't find anything. Sorry!"});
    }
  },

  buildFileResponse: function (fileInfo) {
    var attachment = {
      title: 'File Info',
      title_link: 'Link:',
      color: '#31D57C',
      fields: [],
      image_url: '',
    };

    const pdfOutput = this.getFileHTML

    if (fileInfo.contents) {
      attachment.image_url = path.join(__dirname, 'tmp', )
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
