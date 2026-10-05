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

  // ---------- Animations ----------
  // GSAP (loaded from the CDN) drives the motion. If it failed to load, or the
  // visitor prefers reduced motion, the plain CSS reveal below is used instead.
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const useGsap = Boolean(window.gsap && window.ScrollTrigger) && !reduceMotion;
  const setCounter = (el, value) => (el.textContent = Math.round(value) + (el.dataset.suffix || ""));

  if (useGsap) {
    gsap.registerPlugin(ScrollTrigger);
    document.documentElement.classList.add("gsap");
    const ease = "power4.out";

    // Hand an element back to CSS once its entrance is done, so hover effects work
    const release = (el) => {
      el.classList.add("visible");
      gsap.set(el, { clearProps: "opacity,transform" });
    };

    // Wrap each word of an element in a span so the words can move separately.
    // Child elements (like the gradient word in a headline) stay whole.
    const splitWords = (el, masked) => {
      // A masked headline is read out from its label instead of word by word
      if (masked) el.setAttribute("aria-label", el.textContent.trim());
      const words = [];
      const wrap = (node) => {
        const word = document.createElement("span");
        word.className = "word";
        if (masked) word.setAttribute("aria-hidden", "true");
        word.append(node);
        words.push(word);
        if (!masked) return word;
        const mask = document.createElement("span");
        mask.className = "word-mask";
        mask.append(word);
        return mask;
      };
      const out = [];
      Array.from(el.childNodes).forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          node.textContent.split(/\s+/).filter(Boolean).forEach((text) => out.push(wrap(text), " "));
        } else {
          out.push(wrap(node), " ");
        }
      });
      el.replaceChildren(...out);
      return words;
    };

    // Intro: the banner text comes in line by line on page load,
    // and the headline rises word by word from behind a mask
    const introParts = document.querySelectorAll(".hero-content > *:not(h1), .page-hero-inner > *:not(h1)");
    document.querySelectorAll(".hero-content").forEach(release);
    gsap.from(introParts, {
      opacity: 0,
      y: 24,
      duration: 0.7,
      ease,
      stagger: 0.1,
      delay: 0.15,
      clearProps: "opacity,transform",
    });
    document.querySelectorAll(".hero h1, .page-hero h1").forEach((heading) => {
      gsap.from(splitWords(heading, true), { yPercent: 110, duration: 0.9, ease, stagger: 0.09 });
    });

    // Home banner picture settles in beside the text
    const heroCard = document.querySelector(".hero-logo");
    if (heroCard) {
      gsap.fromTo(
        heroCard,
        { opacity: 0, y: 30, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.9, delay: 0.2, ease, onComplete: () => release(heroCard) }
      );
    }

    // Parallax: banner content drifts and fades as the page scrolls past it
    document.querySelectorAll(".hero-grid, .page-hero-inner").forEach((inner) => {
      const banner = inner.parentElement;
      gsap.to(inner, {
        // A short drift only: a long one pushes the text under the cards below
        y: () => (window.innerWidth > 860 ? Math.min(banner.offsetHeight * 0.1, 60) : 0),
        opacity: 0.15,
        ease: "none",
        scrollTrigger: { trigger: banner, start: "top top", end: "bottom top", scrub: true, invalidateOnRefresh: true },
      });
    });

    // Reading progress line along the bottom edge of the navbar
    const progress = document.createElement("div");
    progress.className = "scroll-progress";
    document.body.append(progress);
    gsap.to(progress, {
      scaleX: 1,
      ease: "none",
      scrollTrigger: { start: 0, end: "max", scrub: 0.3 },
    });

    // Scroll reveal: elements that enter together rise one after another.
    // On wide screens, side-by-side blocks slide in from their own side.
    const wide = window.matchMedia("(min-width: 861px)").matches;
    const sideOffset = (el) => {
      if (!wide) return 0;
      if (el.matches(".director-card")) return -48;
      if (el.matches(".director-bio, .compliance, .contact-form")) return 48;
      return 0;
    };
    const revealEls = gsap.utils.toArray(".reveal").filter((el) => !el.closest(".hero"));
    ScrollTrigger.batch(revealEls, {
      start: "top 88%",
      once: true,
      onEnter: (batch) =>
        batch.forEach((el, i) => {
          const x = sideOffset(el);
          gsap.fromTo(
            el,
            { opacity: 0, x, y: x ? 0 : 28 },
            { opacity: 1, x: 0, y: 0, duration: x ? 0.8 : 0.6, delay: i * 0.06, ease, onComplete: () => release(el) }
          );
        }),
    });

    // Small items inside a block (logos, ticks, chips) pop in one after another
    [
      [".clients", "span", { opacity: 0, scale: 0.9 }],
      [".checklist", "li", { opacity: 0, x: -14 }],
      [".chips", "span", { opacity: 0, y: 10 }],
      [".roles", "span", { opacity: 0, y: 10 }],
      [".why", "div", { opacity: 0, x: -16 }],
      [".reg-grid", "div", { opacity: 0, y: 14 }],
      [".contact-list", ".contact-item", { opacity: 0, y: 14 }],
    ].forEach(([group, child, from]) => {
      document.querySelectorAll(group).forEach((container) => {
        const items = container.querySelectorAll(":scope > " + child);
        if (!items.length) return;
        items.forEach((item) => item.classList.add("gsap-entering"));
        gsap.set(items, from);
        ScrollTrigger.create({
          trigger: container,
          start: "top 88%",
          once: true,
          onEnter: () =>
            gsap.to(items, {
              opacity: 1,
              x: 0,
              y: 0,
              scale: 1,
              duration: 0.5,
              ease,
              stagger: 0.04,
              delay: 0.1,
              onComplete: () => {
                gsap.set(items, { clearProps: "opacity,transform" });
                items.forEach((item) => item.classList.remove("gsap-entering"));
              },
            }),
        });
      });
    });

    // About: the career line draws itself as the timeline is scrolled
    document.querySelectorAll(".timeline").forEach((timeline) => {
      gsap.fromTo(
        timeline,
        { "--line": 0 },
        { "--line": 1, ease: "none", scrollTrigger: { trigger: timeline, start: "top 75%", end: "bottom 65%", scrub: true } }
      );
    });

    // Services: the line joining the six process steps draws across once
    document.querySelectorAll(".process").forEach((steps) => {
      gsap.fromTo(
        steps,
        { "--line": 0 },
        { "--line": 1, duration: 1.2, ease: "power2.out", scrollTrigger: { trigger: steps, start: "top 85%", once: true } }
      );
    });

    // About: the director's quote lights up word by word as it is scrolled
    document.querySelectorAll(".director-quote blockquote p").forEach((quote) => {
      gsap.fromTo(
        splitWords(quote, false),
        { opacity: 0.2 },
        { opacity: 1, ease: "none", stagger: 0.05, scrollTrigger: { trigger: quote, start: "top 82%", end: "top 40%", scrub: true } }
      );
    });

    // Stat numbers count up when they scroll into view
    document.querySelectorAll(".stat-num").forEach((el) => {
      const counter = { value: 0 };
      gsap.to(counter, {
        value: Number(el.dataset.target),
        duration: 1.6,
        ease: "power3.out",
        onUpdate: () => setCounter(el, counter.value),
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
      });
    });

    // ----- Backdrop effects for the whole site: rising particles, light streaks,
    // and a glow under the pointer. They live in one layer fixed behind the page. -----
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const brandColours = ["#7cc242", "#29abe2", "#3b4fa0", "#92278f", "#ed1e79", "#f15a24"];

    const fx = document.createElement("div");
    fx.className = "site-fx";
    fx.setAttribute("aria-hidden", "true");
    document.body.prepend(fx);

    // Particles drift up from the bottom edge of the window
    for (let i = 0; i < 28; i++) {
      const dot = document.createElement("span");
      dot.className = "fx-dot";
      const size = gsap.utils.random(2, 5);
      gsap.set(dot, {
        width: size,
        height: size,
        left: gsap.utils.random(0, 100) + "%",
        backgroundColor: gsap.utils.random(brandColours),
      });
      fx.append(dot);
      const rise = gsap.timeline({ repeat: -1, repeatDelay: gsap.utils.random(0, 2) });
      rise
        .to(dot, { y: () => -(window.innerHeight + 20), x: gsap.utils.random(-60, 60), duration: gsap.utils.random(8, 14), ease: "none" }, 0)
        .to(dot, { opacity: gsap.utils.random(0.4, 0.9), duration: 1, ease: "none" }, 0)
        .to(dot, { opacity: 0, duration: 2, ease: "none" }, ">3");
      rise.progress(Math.random());
    }

    // Thin streaks of light sweep across
    for (let i = 0; i < 6; i++) {
      const line = document.createElement("span");
      line.className = "fx-line";
      const width = gsap.utils.random(120, 280);
      gsap.set(line, { width, top: gsap.utils.random(8, 92) + "%", x: -width });
      fx.append(line);
      gsap
        .timeline({ repeat: -1, repeatDelay: gsap.utils.random(1, 5), delay: gsap.utils.random(0, 4) })
        .to(line, { x: () => window.innerWidth + width, duration: gsap.utils.random(3, 6), ease: "none" }, 0)
        .to(line, { opacity: 0.6, duration: 0.6, ease: "none" }, 0)
        .to(line, { opacity: 0, duration: 0.8, ease: "none" }, ">1");
    }

    // A soft glow follows the pointer anywhere on the page
    if (finePointer) {
      const glow = document.createElement("span");
      glow.className = "fx-glow";
      fx.append(glow);
      const glowX = gsap.quickTo(glow, "x", { duration: 0.6, ease: "power3.out" });
      const glowY = gsap.quickTo(glow, "y", { duration: 0.6, ease: "power3.out" });
      window.addEventListener("pointermove", (e) => {
        glowX(e.clientX);
        glowY(e.clientY);
        gsap.to(glow, { opacity: 1, duration: 0.4, overwrite: "auto" });
      });
      document.documentElement.addEventListener("pointerleave", () => gsap.to(glow, { opacity: 0, duration: 0.6, overwrite: "auto" }));
    }

    // ----- Pointer tilt: cards and the banner picture lean toward the mouse -----
    if (finePointer) {
      document.querySelectorAll(".explore-card, .service-card, .panel-card, .stat").forEach((card) => {
        card.addEventListener("pointermove", (e) => {
          if (!card.classList.contains("visible")) return;
          const box = card.getBoundingClientRect();
          const px = (e.clientX - box.left) / box.width - 0.5;
          const py = (e.clientY - box.top) / box.height - 0.5;
          card.classList.add("tilting");
          gsap.to(card, {
            transformPerspective: 700,
            rotationY: px * 5,
            rotationX: -py * 5,
            y: -4,
            duration: 0.4,
            ease: "power3.out",
            overwrite: "auto",
          });
        });
        card.addEventListener("pointerleave", () => {
          gsap.to(card, {
            rotationY: 0,
            rotationX: 0,
            y: 0,
            duration: 0.5,
            ease: "power3.out",
            overwrite: "auto",
            onComplete: () => {
              gsap.set(card, { clearProps: "transform" });
              card.classList.remove("tilting");
            },
          });
        });
      });

      const hero = document.querySelector(".hero");
      const picture = hero && hero.querySelector(".logo-card img");
      if (picture) {
        gsap.set(picture, { transformPerspective: 900 });
        const tiltX = gsap.quickTo(picture, "rotationX", { duration: 0.8, ease: "power3.out" });
        const tiltY = gsap.quickTo(picture, "rotationY", { duration: 0.8, ease: "power3.out" });
        hero.addEventListener("pointermove", (e) => {
          const box = hero.getBoundingClientRect();
          tiltY(((e.clientX - box.left) / box.width - 0.5) * 8);
          tiltX(-((e.clientY - box.top) / box.height - 0.5) * 6);
        });
        hero.addEventListener("pointerleave", () => {
          tiltX(0);
          tiltY(0);
        });
      }
    }

    // ----- Ticker: the strip of services scrolls sideways without a gap -----
    const tickerList = document.getElementById("tickerList");
    if (tickerList) {
      const copy = tickerList.cloneNode(true);
      copy.removeAttribute("id");
      copy.setAttribute("aria-hidden", "true");
      tickerList.after(copy);
      const scroll = gsap.to([tickerList, copy], { xPercent: -100, duration: 38, ease: "none", repeat: -1 });
      const track = tickerList.parentElement;
      track.addEventListener("pointerenter", () => gsap.to(scroll, { timeScale: 0, duration: 0.4 }));
      track.addEventListener("pointerleave", () => gsap.to(scroll, { timeScale: 1, duration: 0.4 }));
    }

    // Images loading late can shift the page: re-measure the scroll positions
    window.addEventListener("load", () => ScrollTrigger.refresh());
  } else {
    // ---------- Fallback: reveal elements on scroll with CSS ----------
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
      if (siblings.length > 2) el.style.transitionDelay = siblings.indexOf(el) * 30 + "ms";
      revealObserver.observe(el);
    });

    // ---------- Fallback: animated counters ----------
    const animateCounter = (el) => {
      const target = Number(el.dataset.target);
      if (reduceMotion) return setCounter(el, target);
      const duration = 1600;
      const start = performance.now();

      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCounter(el, target * eased);
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
  }

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
  document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
});
