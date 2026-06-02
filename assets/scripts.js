const navToggle = document.querySelector(".nav-toggle")
const mainNav = document.querySelector(".main-nav")

if (navToggle && mainNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("open")
    navToggle.setAttribute("aria-expanded", String(isOpen))
  })
}

document.querySelectorAll(".main-nav a").forEach((link) => {
  link.addEventListener("click", () => {
    mainNav?.classList.remove("open")
    navToggle?.setAttribute("aria-expanded", "false")
  })
})

document.querySelectorAll(".has-dropdown").forEach((item) => {
  item.addEventListener("pointerenter", () => item.classList.add("open"))
  item.addEventListener("pointerleave", () => item.classList.remove("open"))
  item.addEventListener("focusin", () => item.classList.add("open"))
  item.addEventListener("focusout", (event) => {
    if (!item.contains(event.relatedTarget)) item.classList.remove("open")
  })
})

document.querySelectorAll("[data-carousel]").forEach((carousel) => {
  const slides = Array.from(carousel.querySelectorAll("[data-slide]"))
  const dotsWrap = carousel.querySelector("[data-dots]")
  const prev = carousel.querySelector("[data-prev]")
  const next = carousel.querySelector("[data-next]")
  let index = Math.max(0, slides.findIndex((slide) => slide.classList.contains("active")))
  let timer
  let touchStartX = 0

  if (slides.length <= 1) return

  const dots = slides.map((_, dotIndex) => {
    const dot = document.createElement("button")
    dot.type = "button"
    dot.setAttribute("aria-label", `切换到第 ${dotIndex + 1} 个业务`)
    dot.addEventListener("click", () => {
      show(dotIndex)
      restart()
    })
    dotsWrap?.appendChild(dot)
    return dot
  })

  const show = (nextIndex) => {
    const prevIndex = index
    index = (nextIndex + slides.length) % slides.length

    // 当前 slide 向左滑出（exit）
    const prevSlide = slides[prevIndex]
    if (prevSlide && prevIndex !== index) {
      prevSlide.classList.remove("active")
      prevSlide.classList.add("exit")
      // 动画结束后复位到右侧待命
      setTimeout(() => prevSlide.classList.remove("exit"), 560)
    }

    // 新 slide 从右侧滑入
    slides[index].classList.add("active")

    // 更新 dots
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("active", dotIndex === index)
    })
  }

  const start = () => {
    timer = window.setInterval(() => show(index + 1), 5200)
  }

  const stop = () => {
    window.clearInterval(timer)
  }

  const restart = () => {
    stop()
    start()
  }

  prev?.addEventListener("click", () => {
    show(index - 1)
    restart()
  })
  next?.addEventListener("click", () => {
    show(index + 1)
    restart()
  })
  carousel.addEventListener("pointerenter", stop)
  carousel.addEventListener("pointerleave", start)
  carousel.addEventListener("touchstart", (event) => {
    touchStartX = event.touches[0].clientX
  }, { passive: true })
  carousel.addEventListener("touchend", (event) => {
    const deltaX = event.changedTouches[0].clientX - touchStartX
    if (Math.abs(deltaX) > 45) {
      show(index + (deltaX < 0 ? 1 : -1))
      restart()
    }
  })

  show(index)
  start()
})

document.querySelectorAll("[data-booklet]").forEach((booklet) => {
  const images = Array.from(booklet.querySelectorAll("[data-book-page]"))
  const pageImage = booklet.querySelector("[data-book-current]")
  const prev = booklet.querySelector("[data-book-prev]")
  const next = booklet.querySelector("[data-book-next]")
  const count = booklet.querySelector("[data-book-count]")
  const dotsWrap = booklet.querySelector("[data-book-dots]")
  const stage = booklet.querySelector(".book-page")
  const preview = document.querySelector("[data-book-preview]")
  const previewImage = preview?.querySelector("[data-book-preview-image]")
  const previewClose = preview?.querySelector("[data-book-preview-close]")
  let index = 0
  let touchStartX = 0
  let timer

  if (!images.length || !pageImage) return

  const dots = images.map((image, dotIndex) => {
    const dot = document.createElement("button")
    dot.type = "button"
    dot.setAttribute("aria-label", `查看画册第 ${dotIndex + 1} 页`)
    dot.addEventListener("click", () => {
      show(dotIndex)
      restart()
    })
    dotsWrap?.appendChild(dot)
    return dot
  })

  const syncPreview = () => {
    if (!previewImage) return
    previewImage.src = pageImage.src
    previewImage.alt = pageImage.alt
    previewImage.classList.remove("zoomed")
  }

  const show = (nextIndex) => {
    index = (nextIndex + images.length) % images.length
    const nextImage = images[index]
    stage?.classList.add("turning")
    window.setTimeout(() => stage?.classList.remove("turning"), 260)
    pageImage.src = nextImage.dataset.bookPage || nextImage.src
    pageImage.alt = nextImage.alt
    if (count) count.textContent = `${index + 1} / ${images.length}`
    dots.forEach((dot, dotIndex) => dot.classList.toggle("active", dotIndex === index))
    syncPreview()
  }

  const start = () => {
    if (preview?.classList.contains("open")) return
    stop()
    timer = window.setInterval(() => show(index + 1), 3000)
  }

  const stop = () => {
    window.clearInterval(timer)
  }

  const restart = () => {
    stop()
    start()
  }

  const openPreview = () => {
    if (!preview) return
    syncPreview()
    stop()
    preview.classList.add("open")
    preview.setAttribute("aria-hidden", "false")
    document.body.style.overflow = "hidden"
    previewClose?.focus()
    resetZoom()
  }

  const closePreview = () => {
    if (!preview) return
    preview.classList.remove("open")
    preview.setAttribute("aria-hidden", "true")
    document.body.style.overflow = ""
    resetZoom()
    restart()
  }

  // ---------- Zoom & Pan ----------
  const previewStage = preview?.querySelector("[data-preview-stage]")
  let isZoomed = false
  let isPanning = false
  let panStartX = 0
  let panStartY = 0
  let panX = 0
  let panY = 0

  const resetZoom = () => {
    if (!previewImage) return
    isZoomed = false
    isPanning = false
    panX = 0
    panY = 0
    previewImage.classList.remove("zoomed", "dragging")
    previewImage.style.transition = ""
    previewImage.style.transform = ""
    if (previewStage) previewStage.style.cursor = "zoom-in"
  }

  const toggleZoom = () => {
    if (!previewImage) return
    isZoomed = !isZoomed
    panX = 0
    panY = 0
    previewImage.classList.add("zoomed-smooth")
    previewImage.classList.toggle("zoomed", isZoomed)
    previewImage.classList.remove("dragging")
    if (isZoomed) {
      previewImage.style.transform = "scale(2) translate(0px, 0px)"
      if (previewStage) previewStage.style.cursor = "grab"
    } else {
      previewImage.style.transition = ""
      previewImage.style.transform = ""
      if (previewStage) previewStage.style.cursor = "zoom-in"
    }
    window.setTimeout(() => previewImage.classList.remove("zoomed-smooth"), 300)
  }

  // Mouse drag panning
  let dragDist = 0

  const startPan = (clientX, clientY) => {
    if (!isZoomed || !previewImage) return
    isPanning = true
    dragDist = 0
    panStartX = clientX - panX
    panStartY = clientY - panY
    previewImage.classList.add("dragging")
    previewImage.style.transition = "none"
    if (previewStage) previewStage.style.cursor = "grabbing"
  }

  const movePan = (clientX, clientY) => {
    if (!isPanning || !previewImage) return
    const newPanX = clientX - panStartX
    const newPanY = clientY - panStartY
    dragDist += Math.abs(newPanX - panX) + Math.abs(newPanY - panY)
    panX = newPanX
    panY = newPanY
    previewImage.style.transform = `scale(2) translate(${panX}px, ${panY}px)`
  }

  const endPan = () => {
    if (!isPanning || !previewImage) return
    isPanning = false
    previewImage.classList.remove("dragging")
    previewImage.style.transition = ""
    if (previewStage) previewStage.style.cursor = "grab"
  }

  // ---- Mouse events ----
  prev?.addEventListener("click", () => {
    show(index - 1)
    restart()
  })
  next?.addEventListener("click", () => {
    show(index + 1)
    restart()
  })
  pageImage.addEventListener("click", openPreview)
  previewClose?.addEventListener("click", closePreview)
  preview?.addEventListener("mousedown", (event) => {
    if (event.target === preview) closePreview()
  })
  previewImage?.addEventListener("click", (event) => {
    if (dragDist > 8) return
    toggleZoom()
  })
  previewImage?.addEventListener("mousedown", (event) => {
    if (isZoomed) {
      event.preventDefault()
      startPan(event.clientX, event.clientY)
    }
  })
  document.addEventListener("mousemove", (event) => {
    movePan(event.clientX, event.clientY)
  })
  document.addEventListener("mouseup", endPan)

  // ---- Touch events ----
  previewImage?.addEventListener("touchstart", (event) => {
    if (isZoomed && event.touches.length === 1) {
      const touch = event.touches[0]
      startPan(touch.clientX, touch.clientY)
    }
  }, { passive: true })
  document.addEventListener("touchmove", (event) => {
    if (isPanning && event.touches.length === 1) {
      const touch = event.touches[0]
      movePan(touch.clientX, touch.clientY)
    }
  }, { passive: true })
  document.addEventListener("touchend", endPan)

  // ---- Mouse wheel zoom ----
  previewImage?.addEventListener("wheel", (event) => {
    event.preventDefault()
    if (!previewImage) return
    const currentScale = isZoomed ? 2 : 1
    const delta = event.deltaY > 0 ? -0.3 : 0.3
    const newScale = Math.max(1, Math.min(4, currentScale + delta))
    if (newScale === 1) {
      resetZoom()
    } else {
      isZoomed = true
      previewImage.classList.add("zoomed")
      if (previewStage) previewStage.style.cursor = "grab"
      previewImage.style.transform = `scale(${newScale}) translate(${panX}px, ${panY}px)`
    }
  }, { passive: false })

  // ---- Navigate pages within preview ----
  const previewPrev = preview?.querySelector("[data-preview-prev]")
  const previewNext = preview?.querySelector("[data-preview-next]")

  previewPrev?.addEventListener("click", (event) => {
    event.stopPropagation()
    show(index - 1)
    stop()
    if (preview?.classList.contains("open")) {
      syncPreview()
    }
  })
  previewNext?.addEventListener("click", (event) => {
    event.stopPropagation()
    show(index + 1)
    stop()
    if (preview?.classList.contains("open")) {
      syncPreview()
    }
  })

  // ---- Keyboard in preview ----
  document.addEventListener("keydown", (event) => {
    if (!preview?.classList.contains("open")) return
    if (event.key === "Escape") {
      closePreview()
    } else if (event.key === "ArrowLeft") {
      event.preventDefault()
      show(index - 1)
      syncPreview()
    } else if (event.key === "ArrowRight") {
      event.preventDefault()
      show(index + 1)
      syncPreview()
    }
  })
  booklet.addEventListener("pointerenter", stop)
  booklet.addEventListener("pointerleave", start)
  booklet.addEventListener("focusin", stop)
  booklet.addEventListener("focusout", (event) => {
    if (!booklet.contains(event.relatedTarget)) start()
  })
  booklet.addEventListener("touchstart", (event) => {
    touchStartX = event.touches[0].clientX
  }, { passive: true })
  booklet.addEventListener("touchend", (event) => {
    const deltaX = event.changedTouches[0].clientX - touchStartX
    if (Math.abs(deltaX) > 45) {
      show(index + (deltaX < 0 ? 1 : -1))
      restart()
    }
  })

  show(0)
  start()
});

// ===== 返回顶部 =====
(function () {
  const backToTop = document.getElementById("back-to-top")
  if (!backToTop) return

  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  })
})()

// ===== 悬浮侧边栏弹出面板（JSON 配置化） =====
const CX_FLOATING_CONFIG = {
  businessConsult: {
    title: "商务咨询",
    // 四联系人均为二维码 2×2 网格
    items: [
      { img: "assets/images/logo/qrcode.jpg", region: "河南大区", name: "刘总" },
      { img: "assets/images/logo/qrcode.jpg", region: "山东大区", name: "王总" },
      { img: "assets/images/logo/qrcode.jpg", region: "北京大区", name: "张总" },
      { img: "assets/images/logo/qrcode.jpg", region: "其它区域", name: "霍总" }
    ]
  },
  followUs: {
    title: "扫码关注",
    // 四产品 2×2 二维码网格
    items: [
      { name: "澄象在线", img: "assets/images/logo/qrcode.jpg" },
      { name: "家电桥", img: "assets/images/qrcode/jdq.jpg" },
      { name: "享立达", img: "assets/images/qrcode/xld.jpg" },
      { name: "微推好物", img: "assets/images/qrcode/wthw.jpg" }
    ]
  }
};

(function () {
  const groups = document.querySelectorAll(".floating-item-group[data-popup]")
  if (!groups.length) return

  // ===== 商家入驻弹出二维码 =====
  (function () {
    var overlays = document.querySelectorAll(".merchant-overlay")
    var overlay

    if (!overlays.length) {
      overlay = document.createElement("div")
      overlay.className = "merchant-overlay"
      document.body.appendChild(overlay)
    } else {
      overlay = overlays[0]
    }

    document.querySelectorAll(".merchant-btn").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation()
        var popup = this.parentNode.querySelector(".merchant-popup")
        if (!popup) return
        var isOpen = popup.classList.toggle("open")
        overlay.classList.toggle("open", isOpen)
      })
    })

    overlay.addEventListener("click", function () {
      document.querySelectorAll(".merchant-popup.open").forEach(function (p) {
        p.classList.remove("open")
      })
      overlay.classList.remove("open")
    })

    document.querySelectorAll(".merchant-popup-close").forEach(function (closeBtn) {
      closeBtn.addEventListener("click", function () {
        var popup = this.closest(".merchant-popup")
        if (popup) popup.classList.remove("open")
        overlay.classList.remove("open")
      })
    })
  })()

  groups.forEach(function (group) {
    const key = group.getAttribute("data-popup")
    const cfg = CX_FLOATING_CONFIG[key]
    if (!cfg || !cfg.items) return

    var html = '<div class="floating-popup">'
    html += '<div class="popup-header">' + cfg.title + "</div>"
    html += '<div class="popup-qr-grid">'

    cfg.items.forEach(function (item) {
      html += '<div class="popup-qr-box">'
      html += '<img src="' + item.img + '" alt="二维码">'
      if (item.region) {
        html += '<div class="popup-name"><strong>' + item.region + "</strong>" + item.name + "</div>"
      } else {
        html += '<div class="popup-name">' + item.name + "</div>"
      }
      html += "</div>"
    })

    html += "</div></div>"
    group.insertAdjacentHTML("beforeend", html)
  })
})()
