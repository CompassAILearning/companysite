// Mobile navigation toggle
const toggle = document.querySelector(".nav-toggle");
const nav = document.getElementById("site-nav");

toggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
});

nav.addEventListener("click", (e) => {
  if (e.target.tagName === "A") {
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
  }
});

// Sign-up form: client-side validation only.
// TODO: POST to the real sign-up endpoint once the backend exists.
const form = document.getElementById("signup-form");

if (form) {
const errorEl = form.querySelector(".form-error");
const successEl = form.querySelector(".form-success");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const required = [...form.querySelectorAll("[required]")];
  let firstInvalid = null;

  required.forEach((input) => {
    const valid = input.checkValidity() && input.value.trim() !== "";
    input.setAttribute("aria-invalid", String(!valid));
    if (!valid && !firstInvalid) firstInvalid = input;
  });

  if (firstInvalid) {
    errorEl.textContent = "Please fill in your first name, last name, and a valid email.";
    errorEl.hidden = false;
    successEl.hidden = true;
    firstInvalid.focus();
    return;
  }

  errorEl.hidden = true;
  successEl.hidden = false;
  form.querySelector("button[type=submit]").disabled = true;
  console.info("Sign-up data (not yet sent anywhere):", Object.fromEntries(new FormData(form)));
});
}
