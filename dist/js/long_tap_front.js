(() => {
  $('.long-tap').Longtap({
    timeout: 1000,

    onStartDelay: 250,
    onStart: (event, self) => {
      self.addClass('start');

      console.log('on START');
    },

    onSuccess: (event, self) => {
      self.removeClass('start');
      self.addClass('success');

      console.log('on SUCC');

      if (self.storage.selected > 0) {
        if (!$('.panel').hasClass('enabled')) {
          $('.panel').addClass('enabled');
        }

        $('.count').html(self.storage.selected);
      }
    },

    onStop: (event, self) => {
      self.removeClass('start');

      console.log('on STOP');
    },

    onReject: (event, self) => {
      self.removeClass('start');
      self.removeClass('success');

      console.log('on REJECT');

      $('.count').html(self.storage.selected);

      if (self.storage.selected == 0) {
        $('.panel').toggleClass('enabled');
      }
    },

    onClick: (event, $self) => {
      console.log('on CLICK');
    },

    onSelect: (event, $self) => {
      console.log('on SELECT');
    },

    onContext: (event, $self) => {
      console.log('on CONTEXT');
    }

  });
})();
