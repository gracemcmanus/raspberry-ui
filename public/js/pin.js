window.Pin = (function(){
  var socket = io();

  function Pin(definition){
    var that = this;
    var $element = $('<div class="pin"></div>');
    var $label = $('<div class="label"></div>');
    $element
      .css('background-color', definition.color)
      .addClass('pin-' + definition.label)
      .html(definition.index)
      .on('click', function(){
        if (that.toggle()) {
          socket.emit('statechange', {
            index: that.index,
            state: that.state
          });
        }
      });
    $label
      .html(definition.label);
    that.$element = $element;
    that.$label = $label;
    _.assign(that, definition);
    _.each(['statechange', 'error'], function(event){
      socket.on(event, function(msg){
        if (that.index === msg.index) {
          that.setState(msg.state);
        }
      });
    });
    that._updateClass();
  }

  Pin.prototype = {
    _updateClass: function(){
      if (this.state) {
        this.$element.addClass('active');
      } else {
        this.$element.removeClass('active');
      }
      if (this.mutable) {
        this.$element.removeClass('disabled');
      } else {
        this.$element.addClass('disabled');
      }
    },
    toggle: function(){
      return this.setState(this.state ? 0 : 1);
    },
    setState: function(state){
      state = state || 0;
      if (this.state !== state) {
        this.state = state;
        this._updateClass();
        return true;
      }
    }
  };

  return Pin;
}());
