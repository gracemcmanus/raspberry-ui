window.Pin = (function(){
  var socket = io();

  function Pin(definition){
    var that = this;
    var $element = $('<div class="pin"></div>');
    var $label = $('<div class="label"></div>');
    $element
      .addClass('pin-' + definition.name)
      .html(definition.physical)
      .on('click', function(){
        if (that.toggle()) {
          socket.emit('change', {
            wpi: that.wpi,
            value: that.value
          });
        }
      });
    $label
      .html(definition.name);
    that.$element = $element;
    that.$label = $label;
    _.assign(that, definition);
    _.each(['change', 'error'], function(event){
      socket.on(event, function(msg){
        if (that.wpi === msg.wpi) {
          that.setValue(msg.value);
        }
      });
    });
    that._updateClass();
  }

  Pin.prototype = {
    _updateClass: function(){
      if (this.value) {
        this.$element.addClass('active');
      } else {
        this.$element.removeClass('active');
      }
      if (_.isNumber(this.value) && /^gpio/i.test(this.name)) {
        this.$element.removeClass('disabled');
      } else {
        this.$element.addClass('disabled');
      }
    },
    toggle: function(){
      return this.setValue(this.value ? 0 : 1);
    },
    setValue: function(value){
      value = value || 0;
      if (this.value !== value) {
        this.value = value;
        this._updateClass();
        return true;
      }
    }
  };

  return Pin;
}());
