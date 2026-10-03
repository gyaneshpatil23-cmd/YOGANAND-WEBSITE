// Yoganand Electricals & Automation - site scripts

document.addEventListener("DOMContentLoaded", () => {
  const header = document.getElementById("header");
  const navToggle = document.getElementById("navToggle");
  const navMenu = document.getElementById("navMenu");
  const navLinks = document.querySelectorAll(".nav-link");
  const toTop = document.getElementById("toTop");

  // ---------- Mobile menu ----------
  const closeMenu = () => {
    navMenu.classList.remove("open");
    navToggle.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  };

  navToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("open");
    navToggle.classList.toggle("open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.forEach((link) => link.addEventListener("click", closeMenu));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  // ---------- Header shadow + back-to-top button ----------
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle("scrolled", y > 20);
    toTop.classList.toggle("show", y > 600);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  // ---------- Reveal elements on scroll ----------
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        // Drop the stagger delay once revealed so hover effects respond instantly
        entry.target.addEventListener("transitionend", () => (entry.target.style.transitionDelay = ""), { once: true });
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12 }
  );

  // Stagger cards that sit in the same grid
  document.querySelectorAll(".reveal").forEach((el) => {
    const siblings = Array.from(el.parentElement.children).filter((c) => c.classList.contains("reveal"));
    if (siblings.length > 2) el.style.transitionDelay = siblings.indexOf(el) * 60 + "ms";
    revealObserver.observe(el);
  });

  // ---------- Animated counters ----------
  const animateCounter = (el) => {
    const target = Number(el.dataset.target);
    const suffix = el.dataset.suffix || "";
    const duration = 1600;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const counterObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.6 }
  );
  document.querySelectorAll(".stat-num").forEach((el) => counterObserver.observe(el));

  // ---------- Tabs (utilities / systems / materials) ----------
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabPanels = document.querySelectorAll(".tab-panel");

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabButtons.forEach((b) => b.classList.toggle("active", b === btn));
      tabPanels.forEach((panel) => panel.classList.toggle("active", panel.id === btn.dataset.tab));
    });
  });

  // ---------- Contact form -> opens email app ----------
  const form = document.getElementById("contactForm");
  const note = document.getElementById("formNote");

  // Only the contact page has the form
  if (form) form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = form.elements.name;
    const phone = form.elements.phone;
    let valid = true;

    [name, phone].forEach((field) => field.classList.remove("invalid"));

    if (!name.value.trim()) {
      name.classList.add("invalid");
      valid = false;
    }
    if (!/^[0-9+\-\s]{10,15}$/.test(phone.value.trim())) {
      phone.classList.add("invalid");
      valid = false;
    }

    if (!valid) {
      note.textContent = "Please enter your name and a valid phone number.";
      note.className = "form-note error";
      return;
    }

    const service = form.elements.service.value;
    const subject = `Enquiry: ${service} - ${name.value.trim()}`;
    const body = [
      `Name: ${name.value.trim()}`,
      `Phone: ${phone.value.trim()}`,
      `Company / Plant: ${form.elements.company.value.trim() || "-"}`,
      `Interested in: ${service}`,
      "",
      form.elements.message.value.trim(),
    ].join("\n");

    window.location.href =
      "mailto:service@yoganandelectricals.com" +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(body);

    note.textContent = "Thank you! Your email app should open now. You can also call us at 9850953797.";
    note.className = "form-note success";
    form.reset();
  });

  // ---------- Footer year ----------
  document.getElementById("year").textContent = new Date().getFullYear();
});
