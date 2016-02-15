$(function() {
  new Promise(function(resolve, reject){
    $.get('/pins')
      .done(resolve)
      .error(reject);
  })
  .then(function(layout){
    $('#loading').remove();
    var $row, $pinboard = $('#pin-board');
    _.each(layout, function(pinDefinition, i){
      var pin = new Pin(pinDefinition);
      $row = i % 2 ? $row : $('<div class="row">');
      $row.append(pin.$element);
      if (i % 2) {
        pin.$element.after(pin.$label);
      } else {
        pin.$element.before(pin.$label);
      }
      $pinboard.append($row);
    });
  });
});
