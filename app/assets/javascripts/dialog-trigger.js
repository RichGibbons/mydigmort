(function() {
  setInterval(function() {
    $.getJSON('/dialog-trigger', function(data) {
      if(data.dialog_id && (dialog = document.getElementById(data.dialog_id))) {
        dialog.showModal()
      }
    })
  }, 1000);
})()
