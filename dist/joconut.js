/*! Joconut - v0.1.1 - 2012-06-04
* https://github.com/vdemedes/joconut
* Copyright (c) 2012 Vadim Demedes; Licensed MIT */

// Generated by CoffeeScript 1.3.3
var fn;

window._History = (function() {

  function _History() {}

  _History.listeners = {};

  _History.states = {};

  _History.loaded = false;

  _History.init = function() {
    var _this = this;
    if (window.history.replaceState) {
      window.history.replaceState({
        url: location.pathname
      }, document.title, location.pathname);
      this.states[location.pathname] = {
        state: {
          url: location.pathname
        },
        title: document.title
      };
      return window.onpopstate = function() {
        if (_this.loaded) {
          return _this.emit('change', _this.states[location.pathname]);
        }
        return _this.loaded = true;
      };
    } else {
      this.states[location.hash] = {
        state: {
          url: location.pathname
        },
        title: document.title
      };
      return window.onhashchange = function() {
        return _this.emit('change', _this.states[location.hash]);
      };
    }
  };

  _History.emit = function(event, data) {
    var listener, _i, _len, _ref, _results;
    _ref = this.listeners[event];
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      listener = _ref[_i];
      _results.push(listener(data));
    }
    return _results;
  };

  _History.on = function(event, listener) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    return this.listeners[event].push(listener);
  };

  _History.push = function(state, title, url) {
    if (title) {
      document.title = title;
    }
    this.states[history.pushState ? url : "#" + url] = {
      state: state,
      title: title
    };
    if (history.pushState) {
      return history.pushState(state, title, url);
    } else {
      return location.hash = url;
    }
  };

  return _History;

})();

_History.init();

fn = function($) {
  var emit, fill, get, isLocal, listeners, scripts, stylesheets;
  isLocal = new RegExp("^(" + location.protocol + "\/\/" + location.host + "|\\.|\\/|[A-Z0-9_])", 'i');
  $.expr[':'].local = function(e) {
    var href, local;
    if (!e.attributes.href) {
      return false;
    }
    local = false;
    href = e.attributes.href.value;
    if (isLocal.test(href)) {
      local = true;
    }
    return local;
  };
  fill = function(response, callback) {
    var $head, body, href, src, tag;
    body = /<body[^>]*>((.|[\n\r])*)<\/body>/im.exec(response);
    if (!body || !body[1]) {
      return emit('error');
    }
    $('body').html(body[1]);
    document.title = /<title>((.|\n\r])*)<\/title>/im.exec(response)[1];
    $head = void 0;
    while (true) {
      tag = /<script\b[^>]*><\/script>/gm.exec(response);
      if (!tag) {
        break;
      }
      src = /src\=.?([A-Za-z0-9-_.\/]+).?/.exec(tag[0]);
      if (!src) {
        break;
      }
      src = src[1];
      if (-1 === scripts.indexOf(src)) {
        scripts.push(src);
        if (!$head) {
          $head = $('head');
        }
        $head.append(tag[0]);
      }
      response = response.replace(tag[0], '');
    }
    while (true) {
      tag = /<link\b[^>]*\/?>/gm.exec(response);
      if (!tag) {
        break;
      }
      if (/rel\=.?stylesheet.?/.test(tag[0])) {
        href = /href\=.?([A-Za-z0-9-_.\/]+).?/.exec(tag[0]);
        if (!href) {
          break;
        }
        href = href[1];
        if (-1 === stylesheets.indexOf(href)) {
          stylesheets.push(href);
          if (!$head) {
            $head = $('head');
          }
          $head.append(tag[0]);
        }
      }
      response = response.replace(tag[0], '');
    }
    $('html, body').animate({
      scrollTop: 0
    }, 'fast');
    return setTimeout(function() {
      $.joconut();
      if (callback) {
        return callback();
      }
    }, 50);
  };
  get = function(options, callback) {
    emit('beforeNew');
    return $.ajax({
      url: options.url,
      type: 'GET',
      data: options.data,
      timeout: 5000,
      error: function(xhr, status) {
        if (callback) {
          callback(status);
        }
        return emit('error');
      },
      success: function(response) {
        return fill(response, function() {
          if (options.history) {
            _History.push({
              url: options.url
            }, false, options.url);
          }
          if (callback) {
            callback(false, response);
          }
          emit('new');
          return emit('afterNew');
        });
      }
    });
  };
  _History.on('change', function(e) {
    get({
      url: e.state.url,
      history: false
    });
    return emit('new');
  });
  scripts = [];
  $('script').each(function() {
    return scripts.push($(this).attr('src'));
  });
  stylesheets = [];
  $('link').each(function() {
    return stylesheets.push($(this).attr('href'));
  });
  $.joconut = function() {
    return $('a:local').each(function() {
      var el;
      el = $(this);
      return el.live('click', function(e) {
        var url;
        e.preventDefault();
        url = el.attr('href');
        return get({
          url: url,
          history: true
        });
      });
    });
  };
  listeners = {};
  emit = function(event) {
    var listener, _i, _len, _ref, _results;
    if (!listeners[event]) {
      return;
    }
    _ref = listeners[event];
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      listener = _ref[_i];
      _results.push(listener());
    }
    return _results;
  };
  $.joconut.on = function(event, listener) {
    if (!listeners[event]) {
      listeners[event] = [];
    }
    return listeners[event].push(listener);
  };
  return $(function() {
    return $.joconut();
  });
};

fn(jQuery);
