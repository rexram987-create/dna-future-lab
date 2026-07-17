"use strict";

/*
  פתיחה וסגירה של תפריט הצד
*/

const menuButton =
  document.querySelector(".menu-btn");

const sidebar =
  document.querySelector(".sidebar");

const overlay =
  document.querySelector(".overlay");

const closeButtons =
  document.querySelectorAll(
    "[data-close-menu]"
  );

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "[tabindex]:not([tabindex='-1'])"
].join(",");

let previousFocus = null;

if (sidebar) {
  sidebar.inert = true;
}

function openMenu() {
  previousFocus = document.activeElement;

  sidebar?.classList.add("open");
  overlay?.classList.add("open");

  if (sidebar) {
    sidebar.inert = false;
  }

  sidebar?.setAttribute(
    "aria-hidden",
    "false"
  );

  menuButton?.setAttribute(
    "aria-expanded",
    "true"
  );

  document.body.style.overflow =
    "hidden";

  sidebar
    ?.querySelector(focusableSelector)
    ?.focus();
}

function closeMenu(restoreFocus = true) {
  sidebar?.classList.remove("open");
  overlay?.classList.remove("open");

  if (sidebar) {
    sidebar.inert = true;
  }

  sidebar?.setAttribute(
    "aria-hidden",
    "true"
  );

  menuButton?.setAttribute(
    "aria-expanded",
    "false"
  );

  document.body.style.overflow = "";

  if (
    restoreFocus &&
    previousFocus instanceof HTMLElement
  ) {
    previousFocus.focus();
  }
}

menuButton?.addEventListener(
  "click",
  openMenu
);

closeButtons.forEach((button) => {
  button.addEventListener(
    "click",
    () => closeMenu()
  );
});

sidebar?.querySelectorAll("a").forEach((link) => {
  link.addEventListener(
    "click",
    () => closeMenu(false)
  );
});

document.addEventListener(
  "keydown",
  (event) => {
    if (
      event.key === "Escape" &&
      sidebar?.classList.contains("open")
    ) {
      closeMenu();
    }

    if (
      event.key !== "Tab" ||
      !sidebar?.classList.contains("open")
    ) {
      return;
    }

    const focusableElements = [
      ...sidebar.querySelectorAll(
        focusableSelector
      )
    ].filter(
      (element) =>
        !element.hasAttribute("disabled")
    );

    const firstElement =
      focusableElements[0];

    const lastElement =
      focusableElements[
        focusableElements.length - 1
      ];

    if (
      event.shiftKey &&
      document.activeElement === firstElement
    ) {
      event.preventDefault();
      lastElement?.focus();
    } else if (
      !event.shiftKey &&
      document.activeElement === lastElement
    ) {
      event.preventDefault();
      firstElement?.focus();
    }
  }
);

/*
  אנימציית סליל DNA כפול
*/

function initializeDnaAnimation() {
  const canvas =
    document.getElementById("dnaCanvas");

  if (!canvas) {
    return;
  }

  const context =
    canvas.getContext("2d");

  if (!context) {
    return;
  }

  let animationFrameId = null;
  let phase = 0;

  const reduceMotion =
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

  const baseColors = [
    {
      name: "A–T",
      color: "#79f5ff"
    },
    {
      name: "T–A",
      color: "#9bffd5"
    },
    {
      name: "G–C",
      color: "#be9cff"
    },
    {
      name: "C–G",
      color: "#f2a7e8"
    }
  ];

  function getCanvasDimensions() {
    const rectangle =
      canvas.getBoundingClientRect();

    return {
      width: Math.max(
        1,
        rectangle.width
      ),

      height: Math.max(
        1,
        rectangle.height
      )
    };
  }

  function resizeCanvas() {
    const dimensions =
      getCanvasDimensions();

    const pixelRatio =
      Math.min(
        window.devicePixelRatio || 1,
        2
      );

    canvas.width =
      Math.round(
        dimensions.width *
        pixelRatio
      );

    canvas.height =
      Math.round(
        dimensions.height *
        pixelRatio
      );

    context.setTransform(
      pixelRatio,
      0,
      0,
      pixelRatio,
      0,
      0
    );
  }

  function drawLine(
    startX,
    startY,
    endX,
    endY,
    color,
    lineWidth,
    glowAmount = 0
  ) {
    context.save();

    context.beginPath();

    context.moveTo(
      startX,
      startY
    );

    context.lineTo(
      endX,
      endY
    );

    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    context.lineCap = "round";

    if (glowAmount > 0) {
      context.shadowColor = color;
      context.shadowBlur =
        glowAmount;
    }

    context.stroke();
    context.restore();
  }

  function drawCircle(
    x,
    y,
    radius,
    color,
    glowAmount = 0
  ) {
    context.save();

    context.beginPath();

    context.arc(
      x,
      y,
      radius,
      0,
      Math.PI * 2
    );

    context.fillStyle = color;

    if (glowAmount > 0) {
      context.shadowColor = color;
      context.shadowBlur =
        glowAmount;
    }

    context.fill();
    context.restore();
  }

  function drawText(
    text,
    x,
    y,
    color,
    opacity
  ) {
    context.save();

    context.globalAlpha = opacity;
    context.fillStyle = color;
    context.font =
      "600 10px Arial";

    context.textAlign = "center";
    context.textBaseline =
      "middle";

    context.fillText(
      text,
      x,
      y
    );

    context.restore();
  }

  function calculateHelixPoints(
    width,
    height
  ) {
    const topPadding =
      Math.max(58, height * 0.1);

    const bottomPadding =
      Math.max(58, height * 0.1);

    const usableHeight =
      height -
      topPadding -
      bottomPadding;

    const centerX =
      width / 2;

    const amplitude =
      Math.min(
        width * 0.24,
        132
      );

    const numberOfPoints = 180;
    const numberOfTurns = 3.25;

    const strandOne = [];
    const strandTwo = [];

    for (
      let index = 0;
      index <= numberOfPoints;
      index += 1
    ) {
      const progress =
        index / numberOfPoints;

      const y =
        topPadding +
        usableHeight *
        progress;

      const angle =
        progress *
        Math.PI *
        2 *
        numberOfTurns +
        phase;

      const sine =
        Math.sin(angle);

      const cosine =
        Math.cos(angle);

      const firstX =
        centerX +
        sine *
        amplitude;

      const secondX =
        centerX -
        sine *
        amplitude;

      strandOne.push({
        x: firstX,
        y,
        depth: cosine,
        angle
      });

      strandTwo.push({
        x: secondX,
        y,
        depth: -cosine,
        angle
      });
    }

    return {
      strandOne,
      strandTwo,
      centerX
    };
  }

  function drawBackgroundGlow(
    width,
    height
  ) {
    const gradient =
      context.createRadialGradient(
        width / 2,
        height / 2,
        20,
        width / 2,
        height / 2,
        Math.max(
          width,
          height
        ) * 0.55
      );

    gradient.addColorStop(
      0,
      "rgba(89, 224, 255, 0.08)"
    );

    gradient.addColorStop(
      0.45,
      "rgba(116, 121, 255, 0.035)"
    );

    gradient.addColorStop(
      1,
      "rgba(0, 0, 0, 0)"
    );

    context.fillStyle = gradient;

    context.fillRect(
      0,
      0,
      width,
      height
    );
  }

  function drawCenterGuide(
    centerX,
    height
  ) {
    context.save();

    context.setLineDash([
      4,
      12
    ]);

    context.beginPath();

    context.moveTo(
      centerX,
      42
    );

    context.lineTo(
      centerX,
      height - 42
    );

    context.strokeStyle =
      "rgba(114, 240, 255, 0.09)";

    context.lineWidth = 1;
    context.stroke();

    context.restore();
  }

  function drawBasePairs(
    strandOne,
    strandTwo
  ) {
    const pairInterval = 6;

    for (
      let index = 0;
      index < strandOne.length;
      index += pairInterval
    ) {
      const firstPoint =
        strandOne[index];

      const secondPoint =
        strandTwo[index];

      const base =
        baseColors[
          Math.floor(
            index / pairInterval
          ) %
          baseColors.length
        ];

      const depth =
        Math.cos(
          firstPoint.angle
        );

      const normalizedDepth =
        (depth + 1) / 2;

      const opacity =
        0.28 +
        normalizedDepth *
        0.72;

      const width =
        2 +
        normalizedDepth *
        2.2;

      const color =
        hexToRgba(
          base.color,
          opacity
        );

      drawLine(
        firstPoint.x,
        firstPoint.y,
        secondPoint.x,
        secondPoint.y,
        color,
        width,
        12
      );

      const firstHalfX =
        firstPoint.x +
        (
          secondPoint.x -
          firstPoint.x
        ) *
        0.46;

      const secondHalfX =
        firstPoint.x +
        (
          secondPoint.x -
          firstPoint.x
        ) *
        0.54;

      drawCircle(
        firstHalfX,
        firstPoint.y,
        2.2,
        base.color,
        7
      );

      drawCircle(
        secondHalfX,
        secondPoint.y,
        2.2,
        base.color,
        7
      );

      if (
        normalizedDepth > 0.8 &&
        index % 18 === 0
      ) {
        drawText(
          base.name,
          (
            firstPoint.x +
            secondPoint.x
          ) / 2,
          firstPoint.y - 12,
          base.color,
          0.9
        );
      }
    }
  }

  function drawStrand(
    points,
    color,
    reverseDepth = false
  ) {
    /*
      ציור הסליל במקטעים מאפשר
      להעניק עובי ובהירות בהתאם לעומק.
    */

    for (
      let index = 1;
      index < points.length;
      index += 1
    ) {
      const previousPoint =
        points[index - 1];

      const currentPoint =
        points[index];

      let depth =
        (
          previousPoint.depth +
          currentPoint.depth
        ) / 2;

      if (reverseDepth) {
        depth *= -1;
      }

      const normalizedDepth =
        (depth + 1) / 2;

      const lineWidth =
        3.2 +
        normalizedDepth *
        3.8;

      const opacity =
        0.42 +
        normalizedDepth *
        0.58;

      drawLine(
        previousPoint.x,
        previousPoint.y,
        currentPoint.x,
        currentPoint.y,
        hexToRgba(
          color,
          opacity
        ),
        lineWidth,
        15
      );
    }
  }

  function drawBackboneNodes(
    points,
    color
  ) {
    const nodeInterval = 12;

    for (
      let index = 0;
      index < points.length;
      index += nodeInterval
    ) {
      const point =
        points[index];

      const normalizedDepth =
        (point.depth + 1) / 2;

      const radius =
        2.5 +
        normalizedDepth *
        1.8;

      drawCircle(
        point.x,
        point.y,
        radius,
        color,
        11
      );
    }
  }

  function drawFrame() {
    const dimensions =
      getCanvasDimensions();

    const width =
      dimensions.width;

    const height =
      dimensions.height;

    context.clearRect(
      0,
      0,
      width,
      height
    );

    drawBackgroundGlow(
      width,
      height
    );

    const helix =
      calculateHelixPoints(
        width,
        height
      );

    drawCenterGuide(
      helix.centerX,
      height
    );

    /*
      קודם מציירים את זוגות הבסיסים,
      ולאחר מכן את שני השלדים החיצוניים.
      כך שני הגדילים נשארים ברורים.
    */

    drawBasePairs(
      helix.strandOne,
      helix.strandTwo
    );

    drawStrand(
      helix.strandOne,
      "#82f6ff",
      false
    );

    drawStrand(
      helix.strandTwo,
      "#be9cff",
      false
    );

    drawBackboneNodes(
      helix.strandOne,
      "#a2fbff"
    );

    drawBackboneNodes(
      helix.strandTwo,
      "#d0b5ff"
    );

    if (reduceMotion) {
      animationFrameId = null;
      return;
    }

    phase += 0.012;

    animationFrameId =
      window.requestAnimationFrame(
        drawFrame
      );
  }

  function hexToRgba(
    hexadecimalColor,
    alpha
  ) {
    const cleanedColor =
      hexadecimalColor.replace(
        "#",
        ""
      );

    const red =
      parseInt(
        cleanedColor.substring(0, 2),
        16
      );

    const green =
      parseInt(
        cleanedColor.substring(2, 4),
        16
      );

    const blue =
      parseInt(
        cleanedColor.substring(4, 6),
        16
      );

    return (
      `rgba(${red}, ${green}, ` +
      `${blue}, ${alpha})`
    );
  }

  function handleResize() {
    resizeCanvas();

    if (reduceMotion) {
      drawFrame();
    }
  }

  function handleVisibilityChange() {
    if (document.hidden) {
      if (animationFrameId) {
        window.cancelAnimationFrame(
          animationFrameId
        );
      }

      animationFrameId = null;
      return;
    }

    if (!animationFrameId) {
      drawFrame();
    }
  }

  window.addEventListener(
    "resize",
    handleResize
  );

  document.addEventListener(
    "visibilitychange",
    handleVisibilityChange
  );

  resizeCanvas();
  drawFrame();

  window.addEventListener(
    "beforeunload",
    () => {
      if (animationFrameId) {
        window.cancelAnimationFrame(
          animationFrameId
        );
      }
    }
  );
}

document.addEventListener(
  "DOMContentLoaded",
  initializeDnaAnimation
);

