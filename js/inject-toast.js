document.addEventListener('DOMContentLoaded', function () {
  if (localStorage.getItem('gv-subscribed')) return;
  var toast = document.createElement('div');
  toast.className = 'subscribe-toast hidden';
  toast.innerHTML =
    '<button class="close-toast">&times;</button>' +
    '<h3>🎮 New games dropping soon.</h3>' +
    '<p>One email. Only when it matters.</p>' +
    '<form class="subscribe-form">' +
    '<input type="email" name="email" placeholder="your@email.com" required>' +
    '<button type="submit">Notify me</button>' +
    '</form>' +
    '<p class="subscribe-success">✅ You\'re in.</p>';
  document.body.appendChild(toast);
  if (!document.querySelector('link[href*="subscribe.css"]')) {
    var l = document.createElement('link'); l.rel = 'stylesheet';
    var d = (window.location.pathname.match(/\//g) || []).length;
    l.href = '../'.repeat(Math.max(0, d - 2)) + 'css/subscribe.css';
    document.head.appendChild(l);
  }
  setTimeout(function () {
    var form = toast.querySelector('.subscribe-form');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = form.querySelector('input[type="email"]').value;
      var btn = form.querySelector('button[type="submit"]');
      btn.textContent = '...'; btn.disabled = true;
      fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email })
      }).then(function (r) { return r.json(); }).then(function (d) {
        if (d.ok) {
          toast.querySelector('.subscribe-success').style.display = 'block';
          form.style.display = 'none';
          localStorage.setItem('gv-subscribed', '1');
          setTimeout(function () { toast.classList.add('hidden'); }, 3000);
        } else { btn.textContent = 'Try Again'; btn.disabled = false; }
      }).catch(function () { btn.textContent = 'Try Again'; btn.disabled = false; });
    });
    toast.querySelector('.close-toast').addEventListener('click', function () {
      toast.classList.add('hidden');
    });
    setTimeout(function () { toast.classList.remove('hidden'); }, 5000);
  }, 100);
});
