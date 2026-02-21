// Auto-inject subscribe toast into game pages
document.addEventListener('DOMContentLoaded', function () {
  if (localStorage.getItem('gv-subscribed')) return;

  var toast = document.createElement('div');
  toast.className = 'subscribe-toast hidden';
  toast.innerHTML =
    '<button class="close-toast">&times;</button>' +
    '<h3>🎮 Like what you see?</h3>' +
    '<p>Subscribe to get notified when new games are added!</p>' +
    '<form class="subscribe-form" action="https://formspree.io/f/YOUR_FORM_ID" method="POST">' +
    '<input type="email" name="email" placeholder="your@email.com" required>' +
    '<button type="submit">Subscribe</button>' +
    '</form>' +
    '<p class="subscribe-success">✅ Subscribed!</p>';
  document.body.appendChild(toast);

  // Load subscribe CSS if not already present
  if (!document.querySelector('link[href*="subscribe.css"]')) {
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    // Figure out relative path to css folder
    var depth = (window.location.pathname.match(/\//g) || []).length;
    var prefix = '../'.repeat(Math.max(0, depth - 2));
    link.href = prefix + 'css/subscribe.css';
    document.head.appendChild(link);
  }

  // Re-run subscribe.js bindings
  setTimeout(function () {
    var form = toast.querySelector('.subscribe-form');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = form.querySelector('input[type="email"]').value;
      var btn = form.querySelector('button[type="submit"]');
      btn.textContent = 'Subscribing...';
      btn.disabled = true;
      fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email: email })
      }).then(function (r) {
        if (r.ok) {
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
