"use strict";

const navigationRoot = document.querySelector(
  "[data-site-navigation], .side-nav"
);

const navigationGroups = [
  {
    title: "יסודות ה־DNA",
    icon: "🧬",
    items: [
      { label: "מהו DNA?", file: "what-is-dna.html", icon: "◉" },
      { label: "מבנה הסליל הכפול", file: "double-helix.html", icon: "∞" },
      { label: "נוקלאוטידים", file: "nucleotides.html", icon: "⬡", future: true },
      { label: "הבסיסים החנקניים", file: "bases.html", icon: "AT" },
      { label: "גנים וכרומוזומים", file: "genes-chromosomes.html", icon: "X" },
      { label: "DNA מיטוכונדריאלי", file: "mitochondrial-dna.html", icon: "◎", future: true },
      { label: "גנום האדם", file: "human-genome.html", icon: "23", future: true },
      { label: "היסטוריית הגילוי", file: "history.html", icon: "⌛", future: true }
    ]
  },
  {
    title: "מנגנוני ה־DNA",
    icon: "⚙",
    items: [
      { label: "שכפול DNA", file: "replication.html", icon: "⧉" },
      { label: "שעתוק ויצירת RNA", file: "transcription.html", icon: "RNA", future: true },
      { label: "תרגום ויצירת חלבונים", file: "translation.html", icon: "→", future: true },
      { label: "מ־DNA לחלבון", file: "protein-synthesis.html", icon: "P" }
    ]
  },
  {
    title: "גנטיקה בחיים האמיתיים",
    icon: "🔬",
    items: [
      { label: "מוטציות גנטיות", file: "mutations.html", icon: "△", future: true },
      { label: "תורשה", file: "inheritance.html", icon: "↯", future: true },
      { label: "מחלות גנטיות", file: "genetic-diseases.html", icon: "+", future: true },
      { label: "CRISPR ועריכת גנים", file: "crispr.html", icon: "✂", future: true },
      { label: "DNA בזיהוי פלילי", file: "forensics.html", icon: "⌕", future: true }
    ]
  },
  {
    title: "אזור חווייתי",
    icon: "✦",
    items: [
      { label: "מעבדת DNA", file: "lab.html", icon: "⚗", future: true },
      { label: "סרטוני מידע", file: "videos.html", icon: "▶", future: true },
      { label: "מילון מושגים", file: "glossary.html", icon: "א", future: true },
      { label: "חידון", file: "quiz.html", icon: "?", future: true },
      { label: "מקורות", file: "sources.html", icon: "≡", future: true }
    ]
  }
];

function createElement(tag, className, text) {
  const element = document.createElement(tag);

  if (className) {
    element.className = className;
  }

  if (text !== undefined) {
    element.textContent = text;
  }

  return element;
}

function isInnerPage() {
  return window.location.pathname.includes("/pages/");
}

function currentFileName() {
  const path = window.location.pathname;

  if (path.endsWith("/")) {
    return "index.html";
  }

  return path.split("/").pop() || "index.html";
}

function pageHref(fileName) {
  if (fileName === "index.html") {
    return isInnerPage()
      ? "../index.html"
      : "index.html";
  }

  return isInnerPage()
    ? fileName
    : `pages/${fileName}`;
}

function createIcon(value) {
  const icon = createElement(
    "span",
    "nav-icon",
    value
  );

  icon.setAttribute("aria-hidden", "true");
  return icon;
}

function createNavigationItem(item) {
  const element = createElement(
    item.future ? "span" : "a",
    "nav-item"
  );

  element.dataset.search = item.label;
  element.append(createIcon(item.icon));
  element.append(
    createElement(
      "span",
      "nav-item-label",
      item.label
    )
  );

  if (item.future) {
    element.classList.add("disabled");
    element.setAttribute("aria-disabled", "true");
    element.append(
      createElement(
        "small",
        "nav-status",
        "בקרוב"
      )
    );
  } else {
    element.href = pageHref(item.file);

    if (currentFileName() === item.file) {
      element.classList.add("active");
      element.setAttribute(
        "aria-current",
        "page"
      );
    }
  }

  return element;
}

function createNavigationGroup(group) {
  const details = createElement(
    "details",
    "nav-group"
  );

  const hasCurrentPage = group.items.some(
    (item) =>
      item.file === currentFileName()
  );

  details.open = hasCurrentPage;

  const summary = createElement(
    "summary",
    "nav-group-title"
  );

  summary.append(createIcon(group.icon));
  summary.append(
    createElement(
      "span",
      "nav-group-label",
      group.title
    )
  );
  summary.append(
    createElement(
      "span",
      "nav-chevron",
      "⌄"
    )
  );

  const items = createElement(
    "div",
    "nav-group-items"
  );

  group.items.forEach((item) => {
    items.append(createNavigationItem(item));
  });

  details.append(summary, items);
  return details;
}

function updateSearch(query) {
  const normalizedQuery = query
    .trim()
    .toLocaleLowerCase("he");

  let visibleItems = 0;

  navigationRoot
    ?.querySelectorAll(".nav-group")
    .forEach((group) => {
      let visibleInGroup = 0;

      group
        .querySelectorAll(".nav-item")
        .forEach((item) => {
          const matches =
            !normalizedQuery ||
            item.dataset.search
              ?.toLocaleLowerCase("he")
              .includes(normalizedQuery);

          item.hidden = !matches;

          if (matches) {
            visibleItems += 1;
            visibleInGroup += 1;
          }
        });

      group.hidden = visibleInGroup === 0;

      if (normalizedQuery && visibleInGroup) {
        group.open = true;
      }
    });

  const status = navigationRoot?.querySelector(
    "[data-search-status]"
  );

  if (status) {
    status.textContent = normalizedQuery
      ? `נמצאו ${visibleItems} נושאים`
      : "";
  }
}

function buildNavigation() {
  if (!navigationRoot) {
    return;
  }

  navigationRoot.replaceChildren();

  const tools = createElement(
    "div",
    "nav-tools"
  );

  const searchLabel = createElement(
    "label",
    "nav-search"
  );

  searchLabel.append(
    createIcon("⌕")
  );

  const searchInput = createElement(
    "input",
    "nav-search-input"
  );

  searchInput.type = "search";
  searchInput.placeholder = "חיפוש נושא";
  searchInput.setAttribute(
    "aria-label",
    "חיפוש בתפריט"
  );

  searchInput.addEventListener(
    "input",
    () => updateSearch(searchInput.value)
  );

  searchLabel.append(searchInput);
  tools.append(searchLabel);
  tools.append(
    createElement(
      "div",
      "nav-search-status",
      ""
    )
  );
  tools.lastElementChild?.setAttribute(
    "data-search-status",
    ""
  );
  tools.lastElementChild?.setAttribute(
    "aria-live",
    "polite"
  );

  const home = createElement(
    "a",
    "nav-item nav-home"
  );

  home.href = pageHref("index.html");
  home.dataset.search = "עמוד הבית";
  home.append(createIcon("⌂"));
  home.append(
    createElement(
      "span",
      "nav-item-label",
      "עמוד הבית"
    )
  );

  if (currentFileName() === "index.html") {
    home.classList.add("active");
    home.setAttribute("aria-current", "page");
  }

  navigationRoot.append(tools, home);

  navigationGroups.forEach((group) => {
    navigationRoot.append(
      createNavigationGroup(group)
    );
  });

  const pinButton = createElement(
    "button",
    "pin-menu"
  );

  pinButton.type = "button";
  pinButton.setAttribute("data-pin-menu", "");
  pinButton.setAttribute("aria-pressed", "false");
  pinButton.append(createIcon("⌖"));
  pinButton.append(
    createElement(
      "span",
      "pin-menu-label",
      "הצמדת התפריט במחשב"
    )
  );

  navigationRoot.append(pinButton);
}

buildNavigation();
