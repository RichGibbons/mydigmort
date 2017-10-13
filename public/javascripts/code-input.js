(function() {

  $('.code-input .form-control').on('focus', function(e) {
    $(this).closest('.code-input').addClass('code-input-focused');
  });

  $('.code-input .form-control').on('blur', function(e) {
    $(this).closest('.code-input').removeClass('code-input-focused');
  });

  $('.code-input-spaced .form-control').each(function(index, item) {
    var $el = $(item);

    var updater;

    // Older browsers don't support the input event, so we sniff for it and
    // only enable the behaviour if we have it.
    if('oninput' in document.createElement('input')) {
      $el.closest('.code-input').addClass('code-input-spaced-active');
      $el.on('input', function(e) {
        update()
      });
    }

    var previousValue = '';

    function update() {
      var selectionStart = $el.get(0).selectionStart;
      var selectionEnd = $el.get(0).selectionEnd;

      var val = $el.val().replace(' ', '');
      var maxLength = $el.attr('maxlength');

      // Older versions of android flat out ignore maxlength, so we fix that here
      if(val.length > maxLength) {
        $el.val(val.slice(0, maxLength));
        return;
      }

      if(val.length === 3 && previousValue.length < val.length) {
        val = val + ' ';

        if(selectionStart === selectionEnd) {
          selectionStart = ++selectionEnd;
        }
      } else if(val.length === 3 && previousValue.length > val.length) {
        // do nothing, the user is using the backspace key
      } else if(val.length === 0) {
        // Do nothing, the input field is empty
      } else {
        val = [val.slice(0, 3), ' ', val.slice(3)].join('');
        val = val.slice(0, $el.attr('maxlength'))
      }

      $el.val(val);

      $el.get(0).setSelectionRange(selectionStart, selectionEnd);

      previousValue = val.replace(' ', '');
    }

  });

})()
