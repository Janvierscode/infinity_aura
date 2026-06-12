"use strict";

document.documentElement.classList.add("js");

const header = document.querySelector("[data-header]");
const navToggle = document.querySelector(".nav-toggle");
const primaryNav = document.querySelector(".primary-nav");
const navLinks = [...document.querySelectorAll(".nav-link")];
const backToTop = document.querySelector(".back-to-top");
const progressBar = document.querySelector(".scroll-progress span");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function setNavigation(open) {
  navToggle.setAttribute("aria-expanded", String(open));
  navToggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
  primaryNav.classList.toggle("open", open);
  document.body.classList.toggle("nav-open", open);

  if (open) {
    primaryNav.querySelector("a").focus();
  }
}

navToggle.addEventListener("click", () => {
  setNavigation(navToggle.getAttribute("aria-expanded") !== "true");
});

primaryNav.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    setNavigation(false);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && primaryNav.classList.contains("open")) {
    setNavigation(false);
    navToggle.focus();
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 900 && primaryNav.classList.contains("open")) {
    setNavigation(false);
  }
});

function updateScrollUI() {
  const scrollTop = window.scrollY;
  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollableHeight > 0 ? (scrollTop / scrollableHeight) * 100 : 0;

  header.classList.toggle("scrolled", scrollTop > 16);
  backToTop.classList.toggle("visible", scrollTop > 650);
  progressBar.style.width = `${Math.min(progress, 100)}%`;
}

updateScrollUI();
window.addEventListener("scroll", updateScrollUI, { passive: true });

backToTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
});

const revealItems = [...document.querySelectorAll(".reveal")];

if (prefersReducedMotion || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const siblings = [...entry.target.parentElement.children].filter((child) =>
          child.classList.contains("reveal")
        );
        const itemIndex = siblings.indexOf(entry.target);
        entry.target.style.transitionDelay = `${Math.min(itemIndex * 55, 220)}ms`;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -40px" }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
}

const counters = [...document.querySelectorAll(".counter")];

function animateCounter(element) {
  const target = Number(element.dataset.target);
  const duration = prefersReducedMotion ? 0 : 1400;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = duration === 0 ? 1 : Math.min(elapsed / duration, 1);
    const easedProgress = 1 - Math.pow(1 - progress, 3);

    element.textContent = Math.round(target * easedProgress).toLocaleString();

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

if ("IntersectionObserver" in window) {
  const counterObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.7 }
  );

  counters.forEach((counter) => counterObserver.observe(counter));
} else {
  counters.forEach(animateCounter);
}

const observedSections = [...document.querySelectorAll("main section[id]")];

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        navLinks.forEach((link) => {
          link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    },
    { rootMargin: "-42% 0px -50%", threshold: 0 }
  );

  observedSections.forEach((section) => sectionObserver.observe(section));
}

const form = document.querySelector("#contact-form");
const formStatus = form.querySelector(".form-status");
const submitButton = form.querySelector(".form-submit");

const fields = {
  name: {
    input: form.elements.name,
    error: document.querySelector("#name-error"),
    validate: (value) => (value.trim().length >= 2 ? "" : "Please enter your full name.")
  },
  email: {
    input: form.elements.email,
    error: document.querySelector("#email-error"),
    validate: (value) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? "" : "Please enter a valid email address."
  },
  phone: {
    input: form.elements.phone,
    error: document.querySelector("#phone-error"),
    validate: (value) =>
      !value.trim() || /^[+\d][\d\s()-]{6,}$/.test(value.trim())
        ? ""
        : "Please enter a valid phone number."
  },
  message: {
    input: form.elements.message,
    error: document.querySelector("#message-error"),
    validate: (value) =>
      value.trim().length >= 10 ? "" : "Please tell us a little more about your project."
  }
};

function validateField(field) {
  const message = field.validate(field.input.value);
  field.input.classList.toggle("invalid", Boolean(message));
  field.input.setAttribute("aria-invalid", String(Boolean(message)));
  field.error.textContent = message;

  if (message) {
    field.input.setAttribute("aria-describedby", field.error.id);
  } else {
    field.input.removeAttribute("aria-describedby");
  }

  return !message;
}

Object.values(fields).forEach((field) => {
  field.input.addEventListener("blur", () => validateField(field));
  field.input.addEventListener("input", () => {
    if (field.input.classList.contains("invalid")) validateField(field);
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  formStatus.classList.remove("error");
  formStatus.textContent = "";

  const fieldResults = Object.values(fields).map(validateField);
  const isValid = fieldResults.every(Boolean);

  if (!isValid) {
    const firstInvalidField = Object.values(fields).find((field) =>
      field.input.classList.contains("invalid")
    );
    firstInvalidField.input.focus();
    formStatus.classList.add("error");
    formStatus.textContent = "Please correct the highlighted fields.";
    return;
  }

  submitButton.disabled = true;
  submitButton.querySelector("span").textContent = "Sending...";
  formStatus.textContent = "Sending your message securely...";

  const formData = new FormData(form);
  formData.set("_subject", `New Infinity Aura enquiry from ${fields.name.input.value.trim()}`);

  fetch("https://formsubmit.co/ajax/iyakaremyejanvier@gmail.com", {
    method: "POST",
    headers: {
      Accept: "application/json"
    },
    body: formData
  })
    .then((response) => {
      if (!response.ok) throw new Error("The message could not be sent.");
      return response.json();
    })
    .then(() => {
      form.reset();
      Object.values(fields).forEach((field) => {
        field.input.classList.remove("invalid");
        field.input.removeAttribute("aria-invalid");
        field.input.removeAttribute("aria-describedby");
        field.error.textContent = "";
      });
      formStatus.textContent = "Message sent successfully. We’ll get back to you soon.";
    })
    .catch(() => {
      formStatus.classList.add("error");
      formStatus.textContent =
        "We couldn’t send your message right now. Please email iyakaremyejanvier@gmail.com directly.";
    })
    .finally(() => {
      submitButton.disabled = false;
      submitButton.querySelector("span").textContent = "Send Message";
    });
});
