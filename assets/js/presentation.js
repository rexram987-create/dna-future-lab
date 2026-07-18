"use strict";

document.querySelectorAll("[data-presentation]").forEach((presentation) => {
  const slides = [...presentation.querySelectorAll("[data-slide]")];
  const previousButton = presentation.querySelector("[data-slide-prev]");
  const nextButton = presentation.querySelector("[data-slide-next]");
  const counter = presentation.querySelector("[data-slide-counter]");
  const progress = presentation.querySelector("[data-slide-progress]");

  if (!slides.length) {
    return;
  }

  let currentIndex = 0;

  function showSlide(index, moveFocus = false) {
    currentIndex = Math.min(Math.max(index, 0), slides.length - 1);

    slides.forEach((slide, slideIndex) => {
      const active = slideIndex === currentIndex;
      slide.classList.toggle("is-active", active);
      slide.setAttribute("aria-hidden", String(!active));
      slide.toggleAttribute("inert", !active);
    });

    if (counter) {
      counter.textContent = `${currentIndex + 1} מתוך ${slides.length}`;
    }

    if (progress) {
      progress.style.width = `${((currentIndex + 1) / slides.length) * 100}%`;
    }

    if (previousButton) {
      previousButton.disabled = currentIndex === 0;
    }

    if (nextButton) {
      nextButton.disabled = currentIndex === slides.length - 1;
    }

    if (moveFocus) {
      slides[currentIndex].querySelector("h3")?.focus();
    }
  }

  previousButton?.addEventListener("click", () => {
    showSlide(currentIndex - 1, true);
  });

  nextButton?.addEventListener("click", () => {
    showSlide(currentIndex + 1, true);
  });

  presentation.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      showSlide(currentIndex - 1, true);
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showSlide(currentIndex + 1, true);
    }
  });

  showSlide(0);
});