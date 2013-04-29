// Print all of the news items on hackernews
var jsdom = require('jsdom')
  , fs = require('fs')
  , jquery = fs.readFileSync(__dirname + '/../public/javascripts/jquery.min.js').toString()
  , kym_q_pre_url = "http://knowyourmeme.com/search?context=entries&sort=relevance&q="
  , kym_q_post_url = "+category%3Ameme"
  , MAX = 3;


exports.index = function(req, res){
  res.render('index', { title: 'MemeStream' });
};

exports.memes = function(req, res) {
  console.log('[QUERY] "' + req.query.q + '"');
  jsdom.env({
    html: kym_q_pre_url + req.query.q + kym_q_post_url,
    headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_7) AppleWebKit/534.24 (KHTML, like Gecko) Chrome/11.0.696.71 Safari/534.24'},
    src: [jquery],
    done: function (err, window) {
      var $ = window.$;
      if(err) {
        console.log("[ERROR]" + err);
        res.send(err);
      } else {
        var memes = [];
        $('#entries table a.photo').find('.label-confirmed').parent().parent().each(function(i, a){
          if (i >= MAX) {
            return;
          }
          a = $(a);
          var jlabels = a.find('.entry-labels span');
          var meme = {
              href : 'http://knowyourmeme.com'+a.attr('href'),
              img : a.find('img').attr('src'),
              title : a.find('img').attr('title'),
              labels : (function(jls){
                var labels = [];
                jls.each(function(i,s){
                 labels.push($(s).text());
                });
                return labels;
              })(jlabels)}
          memes.push(meme);
        });
        res.send({keyword: req.query.q, memes: memes});
      }
    }
  });

}