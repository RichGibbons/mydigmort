(function() {
  setInterval(function() {
    $.getJSON('/dialog-trigger', function(data) {
      if(data.dialog_id) {

        var dialog = document.getElementById(data.dialog_id)

        if(!dialog) {
          return
        }

        $('dialog').each(function(index, item) {
          dialogPolyfill.registerDialog(item)

          try {
            item.close()
          } catch(e) {
            // Not open, can't close it
          }
        })

        dialog.showModal()
      }
    })

    $.getJSON('/redirect-trigger', function(data) {
      if(data.redirect_destination) {
        window.location = data.redirect_destination
      }
    })
  }, 1000);
})()
