/* ===== Config: replace with the real number (country code, digits only) ===== */
const WHATSAPP_NUMBER = "920000000000";
const WHATSAPP_MESSAGE = "Hello Al-Noor Auto Workshop, I would like to book a service.";

document.querySelectorAll("[data-wa]").forEach((link) => {
  link.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
});

/* ===== Mobile navigation ===== */
const toggle = document.querySelector(".nav-toggle");
const nav = document.getElementById("site-nav");

function setMenu(open) {
  nav.classList.toggle("open", open);
  toggle.setAttribute("aria-expanded", String(open));
}

toggle.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
nav.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && nav.classList.contains("open")) { setMenu(false); toggle.focus(); }
});

/* ===== Active link while scrolling ===== */
const navLinks = [...nav.querySelectorAll("ul a")];
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === `#${entry.target.id}`));
  });
}, { rootMargin: "-45% 0px -50% 0px" });
document.querySelectorAll("main section[id]").forEach((s) => observer.observe(s));

/* ===== Contact form (front-end demo, no backend) ===== */
const form = document.getElementById("contact-form");
const success = document.getElementById("form-success");

const rules = {
  name: (v) => (v.trim().length >= 2 ? "" : "Enter your full name."),
  phone: (v) => (/^\+?[\d\s-]{9,15}$/.test(v.trim()) ? "" : "Enter a valid phone number, e.g. +92 300 0000000."),
  email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Enter a valid email address."),
  service: (v) => (v.trim() ? "" : "Tell us your vehicle or the service you need.")
};

function validateField(name) {
  const input = form.elements[name];
  const message = rules[name](input.value);
  document.getElementById(`${name}-error`).textContent = message;
  input.setAttribute("aria-invalid", String(Boolean(message)));
  input.setAttribute("aria-describedby", `${name}-error`);
  return !message;
}

Object.keys(rules).forEach((name) => {
  form.elements[name].addEventListener("blur", () => validateField(name));
  form.elements[name].addEventListener("input", () => {
    if (form.elements[name].getAttribute("aria-invalid") === "true") validateField(name);
  });
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  success.hidden = true;
  Object.keys(rules).forEach(validateField);
  const firstInvalid = Object.keys(rules).find((name) => form.elements[name].getAttribute("aria-invalid") === "true");
  if (firstInvalid) { form.elements[firstInvalid].focus(); return; }
  form.reset();
  success.hidden = false;
});
