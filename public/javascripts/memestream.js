$(document).ready(function(){
  (function(){

    var tail = null, live_feed = null, station = null, o_query = "";

    var setup_live_feed = function (options) {
      live_feed = RAMP.SDK.LiveFeed({
        pollMSec : options.pollMSec || 1500 ,
        logger: options.logger || false
      });
      live_feed.listen('livefeed', function (data) {
        var output = [];
        $(data).each(function(i,item){
          $('#feed-text').html(station+':[LAST-CC-TAIL]: ' + $.map(item.Data.Text.split(' '), function(v){
            return '<span class="searchable">' + v + '</span>';
          }).join(' '));
          $('.searchable').on('click', function(e){
            query($(e.target).text());
          });
          if(item.Matches.length > 0){
            console.log(item.Matches);
            item.Matches.forEach(function(matches,j){
              matches.Actions.forEach(function(action,k){
                action.Attributes.forEach(function(attr,x){
                  console.log(attr);
                  if(attr.Name == 'term') {
                      output.push(attr.Value);
                  }
                })
              });
            });
          }
        });
        output.forEach(function(mtch,i){
          query(mtch);
        });
      });
    };

    var displayQuery = function(mtch){
      var d = new Date(), f = $('<div>').addClass('dislayed-query');
      f.text('[QUERY@' + d.getHours()+':'+ d.getMinutes() + ':' + d.getSeconds() + ']: ' + mtch);
      f.css({height: '0px', opacity: 0.2});
      $('#match-target').show();
      $('#match-target').prepend(f.animate({height: '40px', opacity: 1}, {duration: 300}, function(){}));
    };

    var isNumber = function (n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
    }

    $('#reset').click(function(){
      reset();
    });
    $('#q-go').click(function(){
      query();
    });
    $('#go').click(function(){
      var pollMSec = $('#poll-interval').val();
      stop_tail_feed();
      setup_live_feed({pollMSec: isNumber(pollMSec) ? pollMSec*1000 : null});
      tail_feed();
    });

    var pull_feed_once = function(){
      tail = [];
      live_feed.request({
        id: $('#channel').val()
      });
    };

    var tail_feed = function(){
      tail = [];
      station = $('#channel option:selected').text();
      live_feed.live({
        id: $('#channel').val()
      });
    };

    var stop_tail_feed = function(){
      if(live_feed){
        live_feed.stop();
        live_feed.forget('livefeed');
      }
    };

    var attachListeners = function(){
      bindHover();
    };

    var bindHover = function(){
      $('#memes-target .thumb').hover(
        function(e){
          $(e.target).addClass('some-shadow');
        },
        function(e){
          $(e.target).removeClass('some-shadow');
        });
    };

    var dawg = function(){
      var d = $('#dawg');
      d.text('2 chars min').show('fast');
      setTimeout(function(){
        d.hide('fast');
      }, 3000);
    };

    var reset = function(){
      $('#memes-target').hide('fast').empty().show();
      $('#max-display').val('3');
      $("#channel").val('1632384');
      $('#poll-interval').val('1.5');
      $('feed-text').empty();
      $('#match-target').empty();
      stop_tail_feed();
    };

    var _truncate = function(s){
      var t = s.length > 21;
      return s.substr(0, t ? 18 : s.length ) + (t ? '...' : '');
    };

    var pullOnce = function(id, options){
      var metaq = new MetaQ({
        feedID: 1632383,
        duration: 2400,
        fetchInterval: 3000,
        handler: function( data ) {
          console.log( data );
        }
      });
    };

    var display = function(data){
      var memes = parseMemes(data)
        , target = $('#memes-target').show();
      memes.reverse().forEach(function(meme){
        meme.css({height: '0px', opacity: 0.2});
        target.prepend(meme.animate({height: '200px', opacity: 1}, {duration: 1000}, function(){
          var length = ('#memes-target a').length;
          if (length > 20){
            for(var ii = 20; ii < length; ii++){
              $($('#memes-target a')[ii]).remove()
            }
          }
        }));

      });
      attachListeners();
    };

    var parseMemes = function(data){
      var ms = $(data.memes)
        , memes = [];
      ms.each(function(i,m){
        var meme = $('<a>')
          .addClass('meme')
          .attr('href', m.href)
          .attr('target', '_blank')
          .attr('title', m.title)
          .append($('<div>')
            .addClass('things')
            .append($('<img>')
              .addClass('thumb')
              .attr('src', m.img))
            .append($('<span>')
              .addClass('title')
              .text(_truncate(m.title))));
        memes.push(meme);
      });
      return memes;
    };

    var query = function(query){
      var q = query || $('#query').val();
      if ($.trim(q).length <= 2)
        return dawg();
      if (o_query == q) return;
      o_query = q;
      $.get(
        document.location.href+'memes',
        'q='+ q,
        function(data) {
          display(data);
          if (data.memes.length > 0) {
            displayQuery(q);
          }
        },
        'json'
      );
    };

  })();
});