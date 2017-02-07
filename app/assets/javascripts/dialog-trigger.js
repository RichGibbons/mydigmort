(function() {
  setInterval(function() {
    $.getJSON('/dialog-trigger', function(data) {
      if(data.dialog_id && (dialog = document.getElementById(data.dialog_id))) {
        dialogPolyfill.registerDialog(dialog)
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
