var eventproxy = require('eventproxy');
var superagent = require('superagent');
var cheerio = require('cheerio');
var url = require('url');

var cnodeUrl = 'https://cnodejs.org/';

superagent.get(cnodeUrl)
  .end(function (err, res) {
    if (err) {
      return console.error(err);
    }
    var topicUrls = [];
    var $ = cheerio.load(res.text);
    $('#topic_list .topic_title').each(function (idx, element) {
      var $element = $(element);
      var href = url.resolve(cnodeUrl, $element.attr('href'));
      var Visits=$('.count_of_visits').eq(idx).text().trim();
      var Replies=$('.count_of_replies').eq(idx).text().trim();

      //console.log("回复数："+Visits);
     var Comment= {
        href: href,
        Visits: Visits,
        Replies:Replies
      }

      topicUrls.push(Comment);

    });

    var ep = new eventproxy();

    ep.after('topic_html', topicUrls.length, function (topics) {
      console.log("length:"+topicUrls.length);


      topics = topics.map(function (topicPair) {
        var topicUrl = topicPair[0];
        var topicVisits = topicPair[1];
        var topicReplies = topicPair[2];
        var topicHtml = topicPair[3];
        console.log("topicVisits:"+topicVisits);

        var $ = cheerio.load(topicHtml);
        return ({
          Visits:topicVisits,
          Replies:topicReplies,
          title: $('.topic_full_title').text().trim(),
          day1: $('.changes span').eq(0).text().trim(),
          Num: $('.changes span').eq(2).text().trim(),
          href: topicUrl,
          comment1: $('.reply_content').eq(0).text().trim(),
        });
      });

      console.log('final:');
      console.log(topics);
    });

    topicUrls.forEach(function (topicUrl) {
      superagent.get(topicUrl["href"])
        .end(function (err, res) {
          //console.log('fetch ' + topicUrl["Visits"] + ' successful');
          ep.emit('topic_html', [topicUrl["href"],topicUrl["Visits"],topicUrl["Replies"], res.text]);
        });
    });
  });
