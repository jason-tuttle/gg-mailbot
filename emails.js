var fs = require('fs');

module.exports = {
  list: [],

  find: function(info) {
    console.log(info);
    if (!user) {
      return;
    } else {
      const user = info.split(' ')[0];
      list = fs.readdirSync('/var/tmp/emails');
      return list.find(item => item.startsWith(user) && item.endsWith('.json'));
    }
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
