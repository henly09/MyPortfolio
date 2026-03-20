(function () {
  "use strict";

  const select = (el, all = false) => {
    el = el.trim();
    return all ? [...document.querySelectorAll(el)] : document.querySelector(el);
  };

  const on = (type, el, listener, all = false) => {
    const selected = select(el, all);
    if (!selected) return;

    if (all) {
      selected.forEach((item) => item.addEventListener(type, listener));
      return;
    }

    selected.addEventListener(type, listener);
  };

  const onscroll = (el, listener) => {
    el.addEventListener("scroll", listener);
  };

  const navbarLinks = select("#navbar .scrollto", true);
  const navbarLinksActive = () => {
    const viewportAnchor = window.scrollY + window.innerHeight * 0.4;
    const isNearBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;

    let activeLink = null;

    navbarLinks.forEach((link) => {
      if (!link.hash) return;
      const section = select(link.hash);
      if (!section) return;

      const inSection =
        viewportAnchor >= section.offsetTop &&
        viewportAnchor < section.offsetTop + section.offsetHeight;

      if (inSection) {
        activeLink = link;
      }
    });

    if (!activeLink && isNearBottom) {
      activeLink = [...navbarLinks].reverse().find((link) => link.hash && select(link.hash)) || null;
    }

    navbarLinks.forEach((link) => {
      link.classList.toggle("active", link === activeLink);
    });
  };

  window.addEventListener("load", navbarLinksActive);
  onscroll(document, navbarLinksActive);

  const scrollTo = (el) => {
    const section = select(el);
    if (!section) return;

    window.scrollTo({
      top: section.offsetTop,
      behavior: "smooth",
    });
  };

  const backToTop = select(".back-to-top");
  if (backToTop) {
    const toggleBackToTop = () => {
      if (window.scrollY > 100) {
        backToTop.classList.add("active");
      } else {
        backToTop.classList.remove("active");
      }
    };

    window.addEventListener("load", toggleBackToTop);
    onscroll(document, toggleBackToTop);
  }

  on("click", ".mobile-nav-toggle", function () {
    select("body").classList.toggle("mobile-nav-active");
    this.classList.toggle("bi-list");
    this.classList.toggle("bi-x");
  });

  on(
    "click",
    ".scrollto",
    function (e) {
      if (!select(this.hash)) return;

      e.preventDefault();
      const body = select("body");

      if (body.classList.contains("mobile-nav-active")) {
        body.classList.remove("mobile-nav-active");
        const navToggle = select(".mobile-nav-toggle");
        navToggle.classList.toggle("bi-list");
        navToggle.classList.toggle("bi-x");
      }

      scrollTo(this.hash);
    },
    true
  );

  window.addEventListener("load", () => {
    if (window.location.hash && select(window.location.hash)) {
      scrollTo(window.location.hash);
    }
  });

  const typed = select(".typed");
  if (typed) {
    let strings = typed.getAttribute("data-typed-items");
    strings = strings ? strings.split(",") : [];

    if (strings.length) {
      new Typed(".typed", {
        strings,
        loop: true,
        typeSpeed: 90,
        backSpeed: 45,
        backDelay: 1900,
      });
    }
  }

  window.addEventListener("load", () => {
    AOS.init({
      duration: 900,
      easing: "ease-in-out",
      once: true,
      mirror: false,
    });
  });

  const initGalleryLightbox = (gallerySelector) => {
    if (typeof PhotoSwipeLightbox === "undefined" || typeof PhotoSwipe === "undefined") return;

    const gallery = select(gallerySelector);
    if (!gallery) return;

    const links = gallery.querySelectorAll("a[href]");
    if (!links.length) return;

    links.forEach((link) => {
      link.removeAttribute("target");
      link.removeAttribute("rel");

      const image = link.querySelector("img");
      if (!image) return;

      const setDimensions = (width, height) => {
        if (!width || !height) return;
        link.dataset.pswpWidth = width;
        link.dataset.pswpHeight = height;
      };

      const source = image.currentSrc || image.src;

      if (image.complete && image.naturalWidth && image.naturalHeight) {
        setDimensions(image.naturalWidth, image.naturalHeight);
      } else if (source) {
        const preload = new Image();
        preload.onload = () => setDimensions(preload.naturalWidth, preload.naturalHeight);
        preload.src = source;
      }

      if (image.alt) {
        link.dataset.pswpAlt = image.alt;
      }
    });

    const lightbox = new PhotoSwipeLightbox({
      gallery: gallerySelector,
      children: "a",
      pswpModule: PhotoSwipe,
      showHideAnimationType: "zoom",
      bgOpacity: 0.9,
      wheelToZoom: true,
    });

    lightbox.init();
  };

  window.addEventListener("load", () => {
    initGalleryLightbox("#portfolio .project-gallery");
    initGalleryLightbox("#certifications .cert-gallery");
  });

  const initGeoLines = () => {
    const canvas = document.getElementById("geo-lines-bg");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let nodes = [];
    const nodeCount = 56;
    const maxLinkDistance = 150;
    const speed = 0.28;
    let animationId = null;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

      nodes = Array.from({ length: nodeCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        r: Math.random() * 1.8 + 1,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < nodes.length; i += 1) {
        const a = nodes[i];
        a.x += a.vx;
        a.y += a.vy;

        if (a.x < 0 || a.x > width) a.vx *= -1;
        if (a.y < 0 || a.y > height) a.vy *= -1;

        for (let j = i + 1; j < nodes.length; j += 1) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);

          if (dist < maxLinkDistance) {
            const alpha = (1 - dist / maxLinkDistance) * 0.22;
            ctx.strokeStyle = `rgba(73, 168, 255, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      nodes.forEach((n, index) => {
        const hue = index % 7 === 0 ? "152, 113, 255" : "80, 185, 255";
        ctx.fillStyle = `rgba(${hue}, 0.68)`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      });

      animationId = window.requestAnimationFrame(draw);
    };

    const handleVisibility = () => {
      if (document.hidden) {
        if (animationId) window.cancelAnimationFrame(animationId);
      } else {
        draw();
      }
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", handleVisibility);
  };

  window.addEventListener("load", initGeoLines);
})();
