"use strict";

const visualCanvases = [
  ...document.querySelectorAll(
    "canvas[data-visual]"
  )
];

const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

const canvasStates = new WeakMap();
let animationFrameId = null;

function resizeCanvas(canvas) {
  const rectangle =
    canvas.getBoundingClientRect();

  const ratio = Math.min(
    window.devicePixelRatio || 1,
    2
  );

  const width = Math.max(
    1,
    Math.round(rectangle.width)
  );

  const height = Math.max(
    1,
    Math.round(rectangle.height)
  );

  const pixelWidth = Math.round(
    width * ratio
  );

  const pixelHeight = Math.round(
    height * ratio
  );

  if (
    canvas.width !== pixelWidth ||
    canvas.height !== pixelHeight
  ) {
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
  }

  const context = canvas.getContext("2d");

  if (!context) {
    return null;
  }

  context.setTransform(
    ratio,
    0,
    0,
    ratio,
    0,
    0
  );

  const state = {
    context,
    width,
    height
  };

  canvasStates.set(canvas, state);
  return state;
}

function line(
  context,
  startX,
  startY,
  endX,
  endY,
  color,
  width = 2,
  glow = 0
) {
  context.save();
  context.beginPath();
  context.moveTo(startX, startY);
  context.lineTo(endX, endY);
  context.strokeStyle = color;
  context.lineWidth = width;
  context.lineCap = "round";
  context.shadowColor = color;
  context.shadowBlur = glow;
  context.stroke();
  context.restore();
}

function circle(
  context,
  x,
  y,
  radius,
  color,
  glow = 0
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
  context.shadowColor = color;
  context.shadowBlur = glow;
  context.fill();
  context.restore();
}

function text(
  context,
  value,
  x,
  y,
  color,
  size = 12
) {
  context.save();
  context.fillStyle = color;
  context.font = `700 ${size}px Arial`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(value, x, y);
  context.restore();
}

function clear(context, width, height) {
  context.clearRect(0, 0, width, height);

  const gradient =
    context.createRadialGradient(
      width / 2,
      height / 2,
      10,
      width / 2,
      height / 2,
      Math.max(width, height) * 0.62
    );

  gradient.addColorStop(
    0,
    "rgba(114, 240, 255, 0.07)"
  );

  gradient.addColorStop(
    1,
    "rgba(0, 0, 0, 0)"
  );

  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);
}

function drawHelix(state, time) {
  const {
    context,
    width,
    height
  } = state;

  clear(context, width, height);

  const centerX = width / 2;
  const top = 45;
  const bottom = height - 45;
  const amplitude = Math.min(
    width * 0.25,
    135
  );
  const turns = 3.1;
  const steps = 120;
  const strandOne = [];
  const strandTwo = [];

  for (
    let index = 0;
    index <= steps;
    index += 1
  ) {
    const progress = index / steps;
    const y = top +
      (bottom - top) * progress;
    const angle = progress *
      Math.PI * 2 * turns +
      time * 0.0012;

    strandOne.push({
      x: centerX +
        Math.sin(angle) * amplitude,
      y,
      depth: Math.cos(angle),
      angle
    });

    strandTwo.push({
      x: centerX -
        Math.sin(angle) * amplitude,
      y,
      depth: -Math.cos(angle),
      angle
    });
  }

  for (
    let index = 0;
    index <= steps;
    index += 6
  ) {
    const first = strandOne[index];
    const second = strandTwo[index];
    const front =
      (Math.cos(first.angle) + 1) / 2;
    const color = index % 12 === 0
      ? "#79f5ff"
      : "#be9cff";

    line(
      context,
      first.x,
      first.y,
      second.x,
      second.y,
      color,
      2 + front * 2,
      9
    );

    text(
      context,
      index % 12 === 0 ? "A–T" : "G–C",
      (first.x + second.x) / 2,
      first.y - 10,
      color,
      10
    );
  }

  for (
    let index = 1;
    index < strandOne.length;
    index += 1
  ) {
    const firstDepth =
      (strandOne[index].depth + 1) / 2;
    const secondDepth =
      (strandTwo[index].depth + 1) / 2;

    line(
      context,
      strandOne[index - 1].x,
      strandOne[index - 1].y,
      strandOne[index].x,
      strandOne[index].y,
      `rgba(121, 245, 255, ${
        0.42 + firstDepth * 0.58
      })`,
      3 + firstDepth * 3.5,
      12
    );

    line(
      context,
      strandTwo[index - 1].x,
      strandTwo[index - 1].y,
      strandTwo[index].x,
      strandTwo[index].y,
      `rgba(190, 156, 255, ${
        0.42 + secondDepth * 0.58
      })`,
      3 + secondDepth * 3.5,
      12
    );
  }
}

function drawBases(state, time) {
  const {
    context,
    width,
    height
  } = state;

  clear(context, width, height);

  const colors = {
    A: "#79f5ff",
    T: "#9bffd5",
    G: "#be9cff",
    C: "#f2a7e8"
  };

  const pairs = [
    ["A", "T"],
    ["G", "C"],
    ["T", "A"],
    ["C", "G"]
  ];

  const spacing =
    height / (pairs.length + 1);

  pairs.forEach((pair, index) => {
    const y = spacing * (index + 1);
    const pulse = 1 +
      Math.sin(time * 0.002 + index) *
      0.08;
    const firstX = width * 0.28;
    const secondX = width * 0.72;

    line(
      context,
      firstX + 34,
      y,
      secondX - 34,
      y,
      "rgba(220, 250, 255, 0.45)",
      3,
      8
    );

    circle(
      context,
      firstX,
      y,
      32 * pulse,
      colors[pair[0]],
      16
    );

    circle(
      context,
      secondX,
      y,
      32 * pulse,
      colors[pair[1]],
      16
    );

    text(
      context,
      pair[0],
      firstX,
      y,
      "#041017",
      20
    );

    text(
      context,
      pair[1],
      secondX,
      y,
      "#041017",
      20
    );

    text(
      context,
      `${pair[0]}  ↔  ${pair[1]}`,
      width / 2,
      y,
      "#dffcff",
      12
    );
  });
}

function drawReplication(state, time) {
  const {
    context,
    width,
    height
  } = state;

  clear(context, width, height);

  const centerX = width / 2;
  const top = 35;
  const bottom = height - 35;
  const splitY = top +
    (bottom - top) * 0.48 +
    Math.sin(time * 0.0015) * 8;
  const amplitude = Math.min(
    width * 0.17,
    90
  );

  for (
    let y = top;
    y < splitY;
    y += 18
  ) {
    const progress =
      (y - top) / (splitY - top);
    const angle = progress * Math.PI * 4;
    const firstX = centerX +
      Math.sin(angle) * amplitude;
    const secondX = centerX -
      Math.sin(angle) * amplitude;

    line(
      context,
      firstX,
      y,
      secondX,
      y,
      "rgba(121, 245, 255, 0.75)",
      2,
      7
    );
    circle(
      context,
      firstX,
      y,
      3,
      "#79f5ff",
      7
    );
    circle(
      context,
      secondX,
      y,
      3,
      "#be9cff",
      7
    );
  }

  line(
    context,
    centerX - amplitude,
    splitY,
    centerX - width * 0.3,
    bottom,
    "#79f5ff",
    5,
    12
  );
  line(
    context,
    centerX + amplitude,
    splitY,
    centerX + width * 0.3,
    bottom,
    "#be9cff",
    5,
    12
  );
  line(
    context,
    centerX - amplitude * 0.75,
    splitY,
    centerX - width * 0.12,
    bottom,
    "#9bffd5",
    4,
    10
  );
  line(
    context,
    centerX + amplitude * 0.75,
    splitY,
    centerX + width * 0.12,
    bottom,
    "#f2a7e8",
    4,
    10
  );
  circle(
    context,
    centerX,
    splitY,
    18,
    "#ffffff",
    18
  );
  text(
    context,
    "הליקאז",
    centerX,
    splitY,
    "#041017",
    10
  );
  text(
    context,
    "גדיל חדש",
    width * 0.2,
    bottom - 15,
    "#9bffd5",
    11
  );
  text(
    context,
    "גדיל חדש",
    width * 0.8,
    bottom - 15,
    "#f2a7e8",
    11
  );
}

function drawProtein(state, time) {
  const {
    context,
    width,
    height
  } = state;

  clear(context, width, height);

  const centerY = height * 0.47;
  const nodes = [
    {
      x: width * 0.12,
      label: "DNA",
      color: "#79f5ff"
    },
    {
      x: width * 0.38,
      label: "mRNA",
      color: "#9bffd5"
    },
    {
      x: width * 0.64,
      label: "ריבוזום",
      color: "#be9cff"
    },
    {
      x: width * 0.88,
      label: "חלבון",
      color: "#f2a7e8"
    }
  ];

  nodes.forEach((node, index) => {
    const pulse = 1 +
      Math.sin(time * 0.002 + index) *
      0.06;

    circle(
      context,
      node.x,
      centerY,
      35 * pulse,
      node.color,
      18
    );

    text(
      context,
      node.label,
      node.x,
      centerY,
      "#041017",
      index === 2 ? 11 : 13
    );

    if (index < nodes.length - 1) {
      line(
        context,
        node.x + 38,
        centerY,
        nodes[index + 1].x - 38,
        centerY,
        "rgba(220, 250, 255, 0.55)",
        3,
        8
      );

      text(
        context,
        "←",
        (node.x + nodes[index + 1].x) / 2,
        centerY - 15,
        "#dffcff",
        19
      );
    }
  });

  const codons = [
    "AUG",
    "GGC",
    "UAC",
    "CCA"
  ];

  codons.forEach((codon, index) => {
    text(
      context,
      codon,
      width * 0.29 + index * 42,
      height * 0.72,
      index % 2 ? "#9bffd5" : "#79f5ff",
      11
    );
  });

  for (
    let index = 0;
    index < 9;
    index += 1
  ) {
    const angle =
      index * 0.75 + time * 0.001;
    const x = width * 0.88 +
      Math.cos(angle) * 18;
    const y = height * 0.72 +
      Math.sin(angle) * 18 +
      index * 3;

    circle(
      context,
      x,
      y,
      5,
      index % 2 ? "#f2a7e8" : "#be9cff",
      7
    );
  }
}

function render(canvas, time) {
  const state = canvasStates.get(canvas) ||
    resizeCanvas(canvas);

  if (!state) {
    return;
  }

  switch (canvas.dataset.visual) {
    case "helix":
      drawHelix(state, time);
      break;
    case "bases":
      drawBases(state, time);
      break;
    case "replication":
      drawReplication(state, time);
      break;
    case "protein":
      drawProtein(state, time);
      break;
    default:
      break;
  }
}

function frame(time) {
  visualCanvases.forEach((canvas) => {
    render(canvas, time);
  });

  animationFrameId =
    window.requestAnimationFrame(frame);
}

function renderStaticFrame() {
  visualCanvases.forEach((canvas) => {
    resizeCanvas(canvas);
    render(canvas, 0);
  });
}

function handleResize() {
  visualCanvases.forEach((canvas) => {
    resizeCanvas(canvas);
    render(canvas, performance.now());
  });
}

function handleVisibilityChange() {
  if (reducedMotion) {
    return;
  }

  if (document.hidden) {
    if (animationFrameId) {
      window.cancelAnimationFrame(
        animationFrameId
      );
    }

    animationFrameId = null;
  } else if (!animationFrameId) {
    animationFrameId =
      window.requestAnimationFrame(frame);
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

if (visualCanvases.length) {
  renderStaticFrame();

  if (!reducedMotion) {
    animationFrameId =
      window.requestAnimationFrame(frame);
  }
}

