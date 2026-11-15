const STORAGE_KEY = "fieldnotes.stories.v1";
const CATEGORIES = ["Ideas", "Learning", "Life", "Technology", "Culture", "Other"];

const starterStories = [
  {
    id: "starter-learning",
    title: "The quiet skill of starting again",
    excerpt: "Progress is rarely a straight line. Sometimes the most useful thing we can learn is how to begin one more time.",
    body: "I used to think a good habit was one I never missed. Then a busy week would arrive, I would fall behind, and the whole plan would feel ruined.\n\nWhat helped was changing the question. Instead of asking, “How do I never stop?” I started asking, “How do I make the next beginning easier?”\n\nA five-minute version of the habit. A book left open on the table. A walk around the block instead of a perfect workout. These small restarts are not compromises. They are how a practice stays alive through real life.\n\nStarting again is a skill we can get better at. And it counts as progress, too.",
    category: "Learning",
    author: "Mira Sen",
    createdAt: "2026-10-18T09:00:00.000Z",
    starter: true
  },
  {
    id: "starter-ideas",
    title: "A notebook is a place to notice",
    excerpt: "You don’t need a brilliant idea to write something down. A small detail can be the beginning of a bigger thought.",
    body: "The best notes I keep are not the impressive ones. They are the odd little observations that would have disappeared if I had trusted my memory: the way rain changes the color of a street, a sentence someone said on the bus, a question that showed up while washing dishes.\n\nWriting them down gives them a little more time. Later, two unrelated notes might start speaking to each other. One becomes a sketch, another becomes a decision. Most remain just what they are: proof that I paid attention.\n\nA notebook does not have to make you productive. It can simply make room for what you notice.",
    category: "Ideas",
    author: "Arun Rao",
    createdAt: "2026-10-12T13:30:00.000Z",
    starter: true
  },
  {
    id: "starter-technology",
    title: "Make technology feel a little more human",
    excerpt: "The best tools don’t ask for our attention all day. They quietly give some of it back.",
    body: "I like software that makes its purpose clear. It tells me what it saved, where it saved it, and what will happen if I leave. It does not hide the useful control behind a clever animation.\n\nThat kind of clarity can feel unremarkable, but it is a form of care. It lowers the effort it takes to trust a tool. It gives people a way to make informed choices without reading a manual first.\n\nA small design question I keep coming back to is this: after someone uses the product, do they feel more capable than before? If the answer is yes, the technology is doing something worthwhile.",
    category: "Technology",
    author: "Nila Thomas",
    createdAt: "2026-10-06T08:15:00.000Z",
    starter: true
  },
  {
    id: "starter-life",
    title: "The long way home",
    excerpt: "Taking the slower route gave me something I didn’t know I was missing: a few minutes with nowhere else to be.",
    body: "One evening I missed my usual turn and decided not to correct it. The longer road went past a bakery closing for the night, a tiny park, and a row of houses with their windows lit.\n\nNothing important happened. That was the point. There was no podcast to finish or destination to optimize. I just walked until I felt like turning toward home.\n\nSince then, I have tried to leave a little margin in my day. Not every route needs to be the fastest one. Not every quiet moment needs to be filled.",
    category: "Life",
    author: "Dev Patel",
    createdAt: "2026-09-29T17:45:00.000Z",
    starter: true
  }
];

const grid = document.querySelector("#story-grid");
const categoriesEl = document.querySelector("#categories");
const searchInput = document.querySelector("#search");
const sortSelect = document.querySelector("#sort");
const countEl = document.querySelector("#story-count");
const emptyState = document.querySelector("#empty-state");
const composer = document.querySelector("#composer");
const reader = document.querySelector("#reader");
const form = document.querySelector("#story-form");
const toast = document.querySelector("#toast");

let localStories = readSavedStories();
let activeCategory = "All stories";
let toastTimer;

function readSavedStories() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (!Array.isArray(stored)) return [];
    return stored.map(normalizeStory).filter(Boolean);
  } catch {
    return [];
  }
}

function normalizeStory(story) {
  if (!story || typeof story !== "object") return null;
  const title = cleanText(story.title, 90);
  const excerpt = cleanText(story.excerpt, 220);
  const body = cleanText(story.body, 30000);
  if (!title || !excerpt || !body) return null;
  const category = CATEGORIES.includes(story.category) ? story.category : "Other";
  const createdAt = Number.isFinite(Date.parse(story.createdAt)) ? new Date(story.createdAt).toISOString() : new Date().toISOString();
  return {
    id: cleanText(story.id, 80) || makeId(), title, excerpt, body, category,
    author: cleanText(story.author, 48) || "You", createdAt,
    updatedAt: Number.isFinite(Date.parse(story.updatedAt)) ? new Date(story.updatedAt).toISOString() : null,
    starter: false
  };
}

function cleanText(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function makeId() {
  return globalThis.crypto?.randomUUID?.() || `story-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function allStories() {
  return [...localStories, ...starterStories];
}

function persistStories() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(localStories));
    return true;
  } catch {
    showToast("This browser could not save your story. Check its storage settings.");
    return false;
  }
}

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

function readingMinutes(body) {
  return Math.max(1, Math.ceil(body.trim().split(/\s+/).filter(Boolean).length / 210));
}

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function addText(parent, tag, text, className) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.textContent = text;
  parent.append(node);
  return node;
}

function renderCategories() {
  const categories = ["All stories", ...new Set(allStories().map(story => story.category))];
  categoriesEl.replaceChildren();
  for (const category of categories) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "category-chip";
    button.textContent = category;
    button.setAttribute("aria-pressed", String(activeCategory === category));
    button.addEventListener("click", () => {
      activeCategory = category;
      render();
    });
    categoriesEl.append(button);
  }
}

function getVisibleStories() {
  const query = searchInput.value.trim().toLocaleLowerCase();
  let result = allStories().filter(story => {
    const matchesCategory = activeCategory === "All stories" || story.category === activeCategory;
    const haystack = `${story.title} ${story.excerpt} ${story.body} ${story.author} ${story.category}`.toLocaleLowerCase();
    return matchesCategory && (!query || haystack.includes(query));
  });
  if (sortSelect.value === "oldest") result.sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
  else if (sortSelect.value === "title") result.sort((a, b) => a.title.localeCompare(b.title));
  else result.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  return result;
}

function createStoryCard(story) {
  const card = document.createElement("article");
  card.className = "story-card";

  const cover = document.createElement("div");
  cover.className = `story-cover cover-${slug(story.category)}`;
  cover.setAttribute("aria-hidden", "true");
  addText(cover, "span", story.category, "cover-label");
  card.append(cover);

  const body = document.createElement("div");
  body.className = "story-card-body";
  const meta = document.createElement("div");
  meta.className = "story-meta";
  addText(meta, "span", story.author);
  addText(meta, "span", "", "meta-dot").setAttribute("aria-hidden", "true");
  addText(meta, "time", formatDate(story.createdAt));
  body.append(meta);

  const heading = document.createElement("h3");
  const openButton = document.createElement("button");
  openButton.type = "button";
  openButton.textContent = story.title;
  openButton.addEventListener("click", () => openStory(story.id));
  heading.append(openButton);
  body.append(heading);
  addText(body, "p", story.excerpt, "story-excerpt");

  const bottom = document.createElement("div");
  bottom.className = "card-bottom";
  addText(bottom, "span", `${readingMinutes(story.body)} min read`, "read-time");
  const actions = document.createElement("div");
  actions.className = "card-actions";
  if (story.starter) {
    const starterLabel = addText(actions, "span", "Sample story", "read-time");
    starterLabel.title = "Example stories included with Fieldnotes";
  } else {
    const edit = document.createElement("button");
    edit.type = "button";
    edit.className = "small-action";
    edit.textContent = "Edit";
    edit.addEventListener("click", () => editStory(story.id));
    actions.append(edit);
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "small-action delete";
    remove.textContent = "Delete";
    remove.addEventListener("click", () => deleteStory(story.id));
    actions.append(remove);
  }
  bottom.append(actions);
  body.append(bottom);
  card.append(body);
  return card;
}

function render() {
  renderCategories();
  const stories = getVisibleStories();
  grid.replaceChildren(...stories.map(createStoryCard));
  countEl.textContent = `${stories.length} ${stories.length === 1 ? "story" : "stories"}`;
  emptyState.hidden = stories.length !== 0;
}

function openComposer(story) {
  form.reset();
  document.querySelector("#story-id").value = story?.id || "";
  document.querySelector("#story-title").value = story?.title || "";
  document.querySelector("#story-author").value = story?.author === "You" ? "" : story?.author || "";
  document.querySelector("#story-category").value = story?.category || "Ideas";
  document.querySelector("#story-excerpt").value = story?.excerpt || "";
  document.querySelector("#story-body").value = story?.body || "";
  document.querySelector("#composer-title").textContent = story ? "Edit your story" : "Write a story";
  document.querySelector("#save-story").textContent = story ? "Save changes" : "Save story";
  document.querySelector("#form-error").hidden = true;
  document.querySelectorAll(".text-input").forEach(input => input.removeAttribute("aria-invalid"));
  composer.showModal();
  requestAnimationFrame(() => document.querySelector("#story-title").focus());
}

function editStory(id) {
  const story = localStories.find(item => item.id === id);
  if (story) openComposer(story);
}

function openStory(id) {
  const story = allStories().find(item => item.id === id);
  if (!story) return;
  const content = document.querySelector("#reader-content");
  content.replaceChildren();
  const top = document.createElement("div");
  top.className = "reader-top";
  const label = addText(top, "span", `${story.category} · ${readingMinutes(story.body)} min read`, "kicker");
  label.style.margin = "0";
  const close = document.createElement("button");
  close.type = "button";
  close.className = "icon-button";
  close.setAttribute("aria-label", "Close story");
  close.textContent = "×";
  close.addEventListener("click", () => reader.close());
  top.append(close);
  content.append(top);
  const cover = document.createElement("div");
  cover.className = `reader-cover cover-${slug(story.category)}`;
  cover.setAttribute("aria-hidden", "true");
  content.append(cover);
  addText(content, "h2", story.title, "reader-title");
  addText(content, "p", story.excerpt, "reader-deck");
  addText(content, "p", `By ${story.author} · ${formatDate(story.createdAt)}${story.updatedAt ? " · Updated" : ""}`, "reader-byline");
  addText(content, "div", story.body, "reader-body");
  if (!story.starter) {
    const actions = document.createElement("div");
    actions.className = "dialog-actions reader-buttons";
    const edit = document.createElement("button");
    edit.type = "button";
    edit.className = "button button-outline";
    edit.textContent = "Edit story";
    edit.addEventListener("click", () => { reader.close(); editStory(story.id); });
    actions.append(edit);
    content.append(actions);
  }
  reader.showModal();
}

function deleteStory(id) {
  const story = localStories.find(item => item.id === id);
  if (!story || !window.confirm(`Delete “${story.title}” from this device?`)) return;
  localStories = localStories.filter(item => item.id !== id);
  const saved = persistStories();
  render();
  if (saved) showToast("Story deleted from this device.");
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2800);
}

function validateField(field) {
  const valid = Boolean(field.value.trim());
  field.setAttribute("aria-invalid", String(!valid));
  return valid;
}

form.addEventListener("submit", event => {
  event.preventDefault();
  const fields = [document.querySelector("#story-title"), document.querySelector("#story-excerpt"), document.querySelector("#story-body")];
  const valid = fields.map(validateField).every(Boolean);
  const error = document.querySelector("#form-error");
  if (!valid) {
    error.textContent = "Add a title, a short introduction, and your story before saving.";
    error.hidden = false;
    fields.find(field => field.getAttribute("aria-invalid") === "true")?.focus();
    return;
  }
  const id = document.querySelector("#story-id").value;
  const existing = localStories.find(story => story.id === id);
  const story = normalizeStory({
    id: existing?.id || makeId(), title: fields[0].value,
    excerpt: fields[1].value, body: fields[2].value,
    category: document.querySelector("#story-category").value,
    author: document.querySelector("#story-author").value || "You",
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: existing ? new Date().toISOString() : null
  });
  if (existing) localStories = localStories.map(item => item.id === id ? story : item);
  else localStories.unshift(story);
  const saved = persistStories();
  composer.close();
  activeCategory = "All stories";
  searchInput.value = "";
  sortSelect.value = "newest";
  render();
  if (saved) showToast(existing ? "Your changes are saved on this device." : "Your story is saved on this device.");
});

function exportBackup() {
  const backup = { format: "fieldnotes-backup-v1", exportedAt: new Date().toISOString(), stories: localStories };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `fieldnotes-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast("Notebook backup downloaded.");
}

async function importBackup(file) {
  if (!file) return;
  if (file.size > 2_000_000) {
    showToast("That backup is too large to import.");
    return;
  }
  try {
    const backup = JSON.parse(await file.text());
    if (backup.format !== "fieldnotes-backup-v1" || !Array.isArray(backup.stories)) throw new Error("Unsupported backup");
    const known = new Set(localStories.map(story => story.id));
    const imported = backup.stories.map(normalizeStory).filter(story => {
      if (!story || known.has(story.id)) return false;
      known.add(story.id);
      return true;
    });
    localStories = [...imported, ...localStories];
    persistStories();
    activeCategory = "All stories";
    render();
    showToast(`${imported.length} ${imported.length === 1 ? "story" : "stories"} imported.`);
  } catch {
    showToast("This file isn’t a valid Fieldnotes backup.");
  }
}

document.querySelector("#new-story").addEventListener("click", () => openComposer());
document.querySelector("#aside-new-story").addEventListener("click", () => openComposer());
searchInput.addEventListener("input", render);
sortSelect.addEventListener("change", render);
document.querySelector("#clear-filters").addEventListener("click", () => {
  searchInput.value = "";
  activeCategory = "All stories";
  render();
});
document.querySelector("#export-data").addEventListener("click", exportBackup);
document.querySelector("#import-trigger").addEventListener("click", () => document.querySelector("#import-file").click());
document.querySelector("#import-file").addEventListener("change", event => {
  importBackup(event.target.files?.[0]);
  event.target.value = "";
});
document.querySelectorAll("[data-close]").forEach(button => button.addEventListener("click", () => document.getElementById(button.dataset.close).close()));
for (const dialog of [composer, reader]) {
  dialog.addEventListener("click", event => {
    if (event.target === dialog) dialog.close();
  });
}

render();

