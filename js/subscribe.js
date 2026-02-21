// Subscribe form — submits email to Google Forms, saves to Google Sheets
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("subscribe-form");
  if (!form) return;

  const GOOGLE_FORM_URL =
    "https://docs.google.com/forms/d/e/1FAIpQLSeTK0Q7OrI-RepR_K_V_nAKQL4mB4D-11MUpovRdWlxpu6bDA/formResponse";
  const EMAIL_ENTRY = "entry.287932181";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const emailInput = form.querySelector('input[name="email"]');
    const btn = form.querySelector("button");
    const email = emailInput.value.trim();
    if (!email) return;

    btn.textContent = "Subscribing...";
    btn.disabled = true;

    try {
      // Submit to Google Forms via no-cors fetch (we won't get a readable response,
      // but the data will be saved to the linked Google Sheet)
      await fetch(GOOGLE_FORM_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `${EMAIL_ENTRY}=${encodeURIComponent(email)}`,
      });

      // Show success (no-cors means we can't check status, but submissions go through)
      form.style.display = "none";
      document.querySelector(".subscribe-success").style.display = "block";
    } catch (err) {
      btn.textContent = "Error — try again";
      btn.disabled = false;
    }
  });
});
