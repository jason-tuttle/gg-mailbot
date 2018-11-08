var fs = require('fs');
var moment = require('moment');

const baseFilePath = '/var/tmp/emails';

module.exports = {
  list: [],

  find: function(info) {
    const user = info.split(' ')[0];
    const timespan = info.split(' ')[1];
    const now = Date.now();

    if (!user) {
      return;
    } else {
      var filelist = fs.readdirSync(baseFilePath);
      // var file = filelist.filter(item => item.startsWith(user) && item.endsWith('.json'));
      var file = filelist.find(item => item.startsWith(user) && item.endsWith('.json'));
      var data = this.buildFileInfo(file);

      console.log(data);
      // return filelist.find(item => item.startsWith(user) && item.endsWith('.json'));
      return this.buildFileResponse(data);
    }
  },

  buildFileInfo: function (filename) {
    const fileInfo = fs.statSync(baseFilePath + '/' + filename);
    const file = JSON.parse(fs.readFileSync(baseFilePath + '/' + filename));
    return {
      name: filename,
      created: fileInfo.birthtime,
      contents: file,
    };
  },

  buildFileResponse: function (fileInfo) {
    var attachment = {
      title: 'File Info',
      title_link: 'Link:',
      color: '#2C3E50',
      fields: [],
    };

    if (fileInfo.contents) {
      attachment.fields.push({
        title: 'To Email',
        value: fileInfo.contents.json.Destination.ToAddresses.toString(),
      });
      attachment.fields.push({
        title: 'Sent',
        value: moment.utc(fileInfo.created).calendar(),
      });
      attachment.fields.push({
        title: 'Subject:',
        value: fileInfo.contents.json.Message.Subject.Data,
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
