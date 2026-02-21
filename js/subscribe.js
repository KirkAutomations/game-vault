// Subscribe form handler
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.subscribe-form').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = form.querySelector('input[type="email"]').value;
      var btn = form.querySelector('button');
      btn.textContent = 'Subscribing...';
      btn.disabled = true;

      fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email: email })
      }).then(function (r) {
        if (r.ok) {
          var msg = form.parentElement.querySelector('.subscribe-success');
          if (msg) { msg.style.display = 'block'; }
          form.style.display = 'none';
          // Hide toast after success
          var toast = form.closest('.subscribe-toast');
          if (toast) { setTimeout(function () { toast.classList.add('hidden'); }, 3000); }
          localStorage.setItem('gv-subscribed', '1');
        } else {
          btn.textContent = 'Try Again';
          btn.disabled = false;
        }
      }).catch(function () {
        btn.textContent = 'Try Again';
        btn.disabled = false;
      });
    });
  });

  // Show toast on game pages after 5 seconds if not already subscribed
  var toast = document.querySelector('.subscribe-toast');
  if (toast && !localStorage.getItem('gv-subscribed')) {
    setTimeout(function () { toast.classList.remove('hidden'); }, 5000);
  }

  // Close toast
  var closeBtn = document.querySelector('.close-toast');
  if (closeBtn) {
    closeBtn.addEventListener('click', function () {
      document.querySelector('.subscribe-toast').classList.add('hidden');
    });
  }
});
