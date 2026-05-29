const navToggle = document.querySelector(".nav-toggle");
const mainNav = document.querySelector(".main-nav");

if (navToggle && mainNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

document.querySelectorAll(".main-nav a").forEach((link) => {
  link.addEventListener("click", () => {
    mainNav?.classList.remove("open");
    navToggle?.setAttribute("aria-expanded", "false");
  });
});

document.querySelectorAll(".has-dropdown").forEach((item) => {
  item.addEventListener("pointerenter", () => item.classList.add("open"));
  item.addEventListener("pointerleave", () => item.classList.remove("open"));
  item.addEventListener("focusin", () => item.classList.add("open"));
  item.addEventListener("focusout", (event) => {
    if (!item.contains(event.relatedTarget)) item.classList.remove("open");
  });
});

document.querySelectorAll("[data-carousel]").forEach((carousel) => {
  const slides = Array.from(carousel.querySelectorAll("[data-slide]"));
  const dotsWrap = carousel.querySelector("[data-dots]");
  const prev = carousel.querySelector("[data-prev]");
  const next = carousel.querySelector("[data-next]");
  let index = Math.max(0, slides.findIndex((slide) => slide.classList.contains("active")));
  let timer;
  let touchStartX = 0;

  if (slides.length <= 1) return;

  const dots = slides.map((_, dotIndex) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", `切换到第 ${dotIndex + 1} 个业务`);
    dot.addEventListener("click", () => {
      show(dotIndex);
      restart();
    });
    dotsWrap?.appendChild(dot);
    return dot;
  });

  const show = (nextIndex) => {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("active", slideIndex === index);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("active", dotIndex === index);
    });
  };

  const start = () => {
    timer = window.setInterval(() => show(index + 1), 5200);
  };

  const stop = () => {
    window.clearInterval(timer);
  };

  const restart = () => {
    stop();
    start();
  };

  prev?.addEventListener("click", () => {
    show(index - 1);
    restart();
  });
  next?.addEventListener("click", () => {
    show(index + 1);
    restart();
  });
  carousel.addEventListener("pointerenter", stop);
  carousel.addEventListener("pointerleave", start);
  carousel.addEventListener("touchstart", (event) => {
    touchStartX = event.touches[0].clientX;
  }, { passive: true });
  carousel.addEventListener("touchend", (event) => {
    const deltaX = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(deltaX) > 45) {
      show(index + (deltaX < 0 ? 1 : -1));
      restart();
    }
  });

  show(index);
  start();
});

document.querySelectorAll("[data-booklet]").forEach((booklet) => {
  const images = Array.from(booklet.querySelectorAll("[data-book-page]"));
  const pageImage = booklet.querySelector("[data-book-current]");
  const prev = booklet.querySelector("[data-book-prev]");
  const next = booklet.querySelector("[data-book-next]");
  const count = booklet.querySelector("[data-book-count]");
  const dotsWrap = booklet.querySelector("[data-book-dots]");
  const stage = booklet.querySelector(".book-page");
  const preview = document.querySelector("[data-book-preview]");
  const previewImage = preview?.querySelector("[data-book-preview-image]");
  const previewClose = preview?.querySelector("[data-book-preview-close]");
  let index = 0;
  let touchStartX = 0;
  let timer;

  if (!images.length || !pageImage) return;

  const dots = images.map((image, dotIndex) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", `查看画册第 ${dotIndex + 1} 页`);
    dot.addEventListener("click", () => {
      show(dotIndex);
      restart();
    });
    dotsWrap?.appendChild(dot);
    return dot;
  });

  const syncPreview = () => {
    if (!previewImage) return;
    previewImage.src = pageImage.src;
    previewImage.alt = pageImage.alt;
    previewImage.classList.remove("zoomed");
  };

  const show = (nextIndex) => {
    index = (nextIndex + images.length) % images.length;
    const nextImage = images[index];
    stage?.classList.add("turning");
    window.setTimeout(() => stage?.classList.remove("turning"), 260);
    pageImage.src = nextImage.dataset.bookPage || nextImage.src;
    pageImage.alt = nextImage.alt;
    if (count) count.textContent = `${index + 1} / ${images.length}`;
    dots.forEach((dot, dotIndex) => dot.classList.toggle("active", dotIndex === index));
    syncPreview();
  };

  const start = () => {
    if (preview?.classList.contains("open")) return;
    stop();
    timer = window.setInterval(() => show(index + 1), 3000);
  };

  const stop = () => {
    window.clearInterval(timer);
  };

  const restart = () => {
    stop();
    start();
  };

  const openPreview = () => {
    if (!preview) return;
    syncPreview();
    stop();
    preview.classList.add("open");
    preview.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    previewClose?.focus();
  };

  const closePreview = () => {
    if (!preview) return;
    preview.classList.remove("open");
    preview.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    previewImage?.classList.remove("zoomed");
    restart();
  };

  prev?.addEventListener("click", () => {
    show(index - 1);
    restart();
  });
  next?.addEventListener("click", () => {
    show(index + 1);
    restart();
  });
  pageImage.addEventListener("click", openPreview);
  previewClose?.addEventListener("click", closePreview);
  preview?.addEventListener("click", (event) => {
    if (event.target === preview) closePreview();
  });
  previewImage?.addEventListener("click", () => {
    previewImage.classList.toggle("zoomed");
  });
  booklet.addEventListener("pointerenter", stop);
  booklet.addEventListener("pointerleave", start);
  booklet.addEventListener("focusin", stop);
  booklet.addEventListener("focusout", (event) => {
    if (!booklet.contains(event.relatedTarget)) start();
  });
  booklet.addEventListener("touchstart", (event) => {
    touchStartX = event.touches[0].clientX;
  }, { passive: true });
  booklet.addEventListener("touchend", (event) => {
    const deltaX = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(deltaX) > 45) {
      show(index + (deltaX < 0 ? 1 : -1));
      restart();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && preview?.classList.contains("open")) {
      closePreview();
    }
  });

  show(0);
  start();
});
