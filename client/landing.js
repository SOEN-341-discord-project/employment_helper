"use strict";

/*
 * CareerConnect homepage interactions
 * HTML supplies the content; CSS handles the appearance and animations.
 * JavaScript connects user actions to those CSS effects.
 * Each feature has its own setup function below.
 * The script uses `defer` in index.html, so the HTML exists before this runs.
 */
const reducedMotionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
let animationsPaused = reducedMotionPreference.matches;

// Start each independent feature when the page loads.
setupMotionControls();
setupScrollReveals();
setupScrollProgress();
setupDashboardTilt();
setupMobileMenu();
setupApplicationTabs();
updateCopyrightYear();

// 1. MOTION CONTROLS — pause animations and remember the visitor's choice.
function setupMotionControls() {
  const motionButton = document.querySelector("#motion-toggle");
  const dashboard = document.querySelector("#hero-scene");
  const storageKey = "careerconnect-motion";
  let savedPreference = null;

  // Storage may be blocked. The button should still work in that case.
  try {
    savedPreference = localStorage.getItem(storageKey);
  } catch {
    // Use the device preference if a saved choice is unavailable.
  }
  animationsPaused = reducedMotionPreference.matches || savedPreference === "off";

  function updateMotionDisplay() {
    // The .motion-off rules in landing.css stop animations across the page.
    document.documentElement.classList.toggle("motion-off", animationsPaused);
    motionButton.setAttribute("aria-pressed", String(animationsPaused));
    if (animationsPaused) {
      motionButton.setAttribute("aria-label", "Enable animations");
      motionButton.innerHTML = 'Motion: off <span aria-hidden="true">◉</span>';
      dashboard.style.transform = "";
    } else {
      motionButton.setAttribute("aria-label", "Pause animations");
      motionButton.innerHTML = 'Motion: on <span aria-hidden="true">◉</span>';
    }
  }

  motionButton.addEventListener("click", function () {
    animationsPaused = !animationsPaused;
    savedPreference = animationsPaused ? "off" : "on";
    updateMotionDisplay();
    try {
      localStorage.setItem(storageKey, savedPreference);
    } catch {
      // The setting still works for this visit if it cannot be saved.
    }
  });
  reducedMotionPreference.addEventListener("change", function (event) {
    animationsPaused = event.matches || savedPreference === "off";
    updateMotionDisplay();
  });
  updateMotionDisplay();
}

// 2. SCROLL REVEALS — show a section when it enters the visible screen.
function setupScrollReveals() {
  // If unsupported, leave all content visible normally.
  if (!("IntersectionObserver" in window)) {
    return;
  }
  function revealVisibleSections(entries, observer) {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        // CSS changes opacity and position when .visible is added.
        entry.target.classList.add("visible");
        observer.unobserve(entry.target); // Reveal each section only once.
      }
    }
  }
  const observer = new IntersectionObserver(revealVisibleSections, {
    threshold: 0.12, // Reveal once 12% of the section is visible.
  });
  document.documentElement.classList.add("js-motion");
  for (const section of document.querySelectorAll(".reveal")) {
    observer.observe(section);
  }
}

// 3. SCROLL PROGRESS — stretch the thin line at the top as the visitor scrolls.
function setupScrollProgress() {
  const progressBar = document.querySelector(".scroll-progress");
  let updateScheduled = false;

  function updateProgressBar() {
    const pageHeight = document.documentElement.scrollHeight;
    const scrollableDistance = pageHeight - window.innerHeight;
    let progress = 0;
    if (scrollableDistance > 0) {
      progress = window.scrollY / scrollableDistance;
    }
    // scaleX(0) is empty; scaleX(1) fills the entire width.
    progressBar.style.transform = `scaleX(${progress})`;
    updateScheduled = false;
  }
  window.addEventListener(
    "scroll",
    function () {
      // Scroll events fire rapidly. Update at most once per animation frame.
      if (!updateScheduled) {
        updateScheduled = true;
        requestAnimationFrame(updateProgressBar);
      }
    },
    { passive: true },
  );
  window.addEventListener("resize", updateProgressBar, { passive: true });
  updateProgressBar();
}

// 4. DASHBOARD TILT — rotate an HTML illustration to create a 3D effect.
function setupDashboardTilt() {
  const artworkArea = document.querySelector(".hero-visual");
  const dashboard = document.querySelector("#hero-scene");
  const mouseAvailable = window.matchMedia("(hover: hover) and (pointer: fine)");
  let pendingFrame = 0;

  artworkArea.addEventListener("pointermove", function (event) {
    if (animationsPaused || !mouseAvailable.matches) {
      return; // Skip tilt on touch devices or when motion is paused.
    }
    cancelAnimationFrame(pendingFrame);
    pendingFrame = requestAnimationFrame(function () {
      if (animationsPaused) {
        return;
      }
      const bounds = artworkArea.getBoundingClientRect();
      // Each position ranges from -0.5 to +0.5. The center is 0.
      const horizontalPosition = (event.clientX - bounds.left) / bounds.width - 0.5;
      const verticalPosition = (event.clientY - bounds.top) / bounds.height - 0.5;
      const rotationX = 7 - verticalPosition * 10;
      const rotationY = -13 + horizontalPosition * 15;
      const rotationZ = -6 + horizontalPosition * 3;
      dashboard.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg) rotateZ(${rotationZ}deg)`;
    });
  });
  artworkArea.addEventListener("pointerleave", function () {
    cancelAnimationFrame(pendingFrame);
    dashboard.style.transform = ""; // Restore the default angle from CSS.
  });
}

// 5. MOBILE MENU — show and hide navigation on smaller screens.
function setupMobileMenu() {
  const menuButton = document.querySelector(".menu-toggle");
  const menu = document.querySelector("#mobile-menu");

  function setMenuOpen(isOpen) {
    menu.hidden = !isOpen;
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  }
  function closeMenu() {
    setMenuOpen(false);
  }
  menuButton.addEventListener("click", function () {
    setMenuOpen(menu.hidden);
  });
  for (const link of menu.querySelectorAll("a")) {
    link.addEventListener("click", closeMenu);
  }
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !menu.hidden) {
      closeMenu();
      menuButton.focus();
    }
  });
  document.addEventListener("click", function (event) {
    if (!event.target.closest(".site-header")) {
      closeMenu();
    }
  });
  // Close when switching between mobile and desktop layouts.
  window.matchMedia("(max-width: 900px)").addEventListener("change", closeMenu);
}

// 6. APPLICATION TABS — filter sample cards without contacting a server.
function setupApplicationTabs() {
  const tabs = Array.from(document.querySelectorAll("[data-filter]"));
  const applicationCards = document.querySelectorAll("[data-stage]");
  const panel = document.querySelector("#preview-panel");
  const countLabel = document.querySelector("#preview-count");

  function selectTab(selectedTab) {
    const selectedStage = selectedTab.dataset.filter;
    for (const tab of tabs) {
      const isSelected = tab === selectedTab;
      tab.setAttribute("aria-selected", String(isSelected));
      tab.tabIndex = isSelected ? 0 : -1;
    }
    let visibleCount = 0;
    for (const card of applicationCards) {
      const matchesFilter =
        selectedStage === "all" || card.dataset.stage === selectedStage;
      card.hidden = !matchesFilter;
      if (matchesFilter) {
        card.style.animationDelay = `${visibleCount * 45}ms`;
        visibleCount += 1;
      }
    }
    // ARIA attributes describe the active tab to screen readers.
    panel.setAttribute("aria-labelledby", selectedTab.id);
    const possibilityLabel = visibleCount === 1 ? "possibility" : "possibilities";
    countLabel.textContent = `${visibleCount} ${possibilityLabel}. One place.`;
  }

  function handleTabKeydown(event, currentIndex) {
    let nextIndex = currentIndex;
    switch (event.key) {
      case "ArrowRight":
        nextIndex = (currentIndex + 1) % tabs.length;
        break;
      case "ArrowLeft":
        nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = tabs.length - 1;
        break;
      default:
        return; // Leave other keys to the browser.
    }
    event.preventDefault();
    tabs[nextIndex].focus();
    selectTab(tabs[nextIndex]);
  }

  tabs.forEach(function (tab, index) {
    tab.addEventListener("click", function () {
      selectTab(tab);
    });
    tab.addEventListener("keydown", function (event) {
      handleTabKeydown(event, index);
    });
  });
}

// 7. FOOTER YEAR — keep the year current automatically.
function updateCopyrightYear() {
  document.querySelector("#year").textContent = new Date().getFullYear();
}
