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

  const initParticlesBackground = () => {
    if (typeof particlesJS !== "function") return;
    if (!document.getElementById("particles-js")) return;

    particlesJS("particles-js", {
      particles: {
        number: {
          value: 140,
          density: {
            enable: true,
            value_area: 1100,
          },
        },
        color: {
          value: ["#4fa5ff", "#8c6bff", "#6dd5fa"],
        },
        shape: {
          type: "circle",
        },
        opacity: {
          value: 0.62,
          random: true,
        },
        size: {
          value: 3.3,
          random: true,
        },
        line_linked: {
          enable: true,
          distance: 130,
          color: "#89b6ff",
          opacity: 0.52,
          width: 1.2,
        },
        move: {
          enable: true,
          speed: 1.4,
          direction: "none",
          random: true,
          straight: false,
          out_mode: "out",
          bounce: false,
        },
      },
      interactivity: {
        detect_on: "canvas",
        events: {
          onhover: {
            enable: true,
            mode: ["grab", "bubble"],
          },
          onclick: {
            enable: true,
            mode: ["push", "repulse"],
          },
          resize: true,
        },
        modes: {
          grab: {
            distance: 150,
            line_linked: {
              opacity: 0.75,
            },
          },
          bubble: {
            distance: 220,
            size: 6.5,
            duration: 2,
            opacity: 0.82,
            speed: 3,
          },
          repulse: {
            distance: 180,
            duration: 0.45,
          },
          push: {
            particles_nb: 5,
          },
        },
      },
      retina_detect: true,
    });
  };

  window.addEventListener("load", initParticlesBackground);
})();


// ===== Certifications Filter =====
document.addEventListener('DOMContentLoaded', function() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const certItems = document.querySelectorAll('.cert-item');

  filterButtons.forEach(button => {
    button.addEventListener('click', function() {
      filterButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');

      const filterValue = this.getAttribute('data-filter');

      certItems.forEach(item => {
        if (filterValue === 'all' || item.getAttribute('data-category').includes(filterValue)) {
          item.classList.remove('hidden');
          item.style.animation = 'fadeIn 0.4s ease';
        } else {
          item.classList.add('hidden');
        }
      });
    });
  });
});

// Add fadeIn keyframe if not already present
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(style);
