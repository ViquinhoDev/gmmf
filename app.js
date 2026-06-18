const supportedLanguages = ["pt", "en", "es", "fr", "de"];
const translations = {
  pt: { byline: 'por: <a href="https://github.com/Viquinhodev" target="_blank" rel="noreferrer">Viquinhodev</a>', navGames: "Games", navMovies: "Movies", navMusics: "Musics", heroEyebrow: "Games • Movies • Musics • Free", heroTitle: "Tudo em um só portal gamer.", heroText: "Escolha uma coleção, abra um cover e edite todo o catálogo pelo JSON.", empty: "Adicione itens em catalog.json para preencher esta classe." },
  en: { byline: 'by: <a href="https://github.com/Viquinhodev" target="_blank" rel="noreferrer">Viquinhodev</a>', navGames: "Games", navMovies: "Movies", navMusics: "Musics", heroEyebrow: "Games • Movies • Musics • Free", heroTitle: "Everything in one gamer portal.", heroText: "Choose a collection, open a cover, and edit the whole catalog in JSON.", empty: "Add items in catalog.json to fill this class." },
  es: { byline: 'por: <a href="https://github.com/Viquinhodev" target="_blank" rel="noreferrer">Viquinhodev</a>', navGames: "Juegos", navMovies: "Películas", navMusics: "Músicas", heroEyebrow: "Juegos • Películas • Músicas • Gratis", heroTitle: "Todo en un portal gamer.", heroText: "Elige una colección, abre una portada y edita todo el catálogo en JSON.", empty: "Agrega elementos en catalog.json para llenar esta clase." },
  fr: { byline: 'par: <a href="https://github.com/Viquinhodev" target="_blank" rel="noreferrer">Viquinhodev</a>', navGames: "Jeux", navMovies: "Films", navMusics: "Musiques", heroEyebrow: "Jeux • Films • Musiques • Gratuit", heroTitle: "Tout dans un portail gamer.", heroText: "Choisis une collection, ouvre une couverture et modifie tout le catalogue en JSON.", empty: "Ajoutez des éléments dans catalog.json pour remplir cette classe." },
  de: { byline: 'von: <a href="https://github.com/Viquinhodev" target="_blank" rel="noreferrer">Viquinhodev</a>', navGames: "Spiele", navMovies: "Filme", navMusics: "Musik", heroEyebrow: "Spiele • Filme • Musik • Kostenlos", heroTitle: "Alles in einem Gamer-Portal.", heroText: "Wähle eine Sammlung, öffne ein Cover und bearbeite den Katalog per JSON.", empty: "Füge Elemente in catalog.json hinzu, um diese Klasse zu füllen." }
};

let catalog = {};
let currentLang = "pt";
let currentSection = "games";

const content = document.querySelector("#content");
const modal = document.querySelector("#item-modal");
const modalCover = document.querySelector("#modal-cover");
const modalTitle = document.querySelector("#modal-title");
const modalTags = document.querySelector("#modal-tags");
const modalDescription = document.querySelector("#modal-description");
const modalAction = document.querySelector("#modal-action");

function localize(value) {
  if (typeof value === "string") return value;
  return value?.[currentLang] || value?.pt || value?.en || "";
}

function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.innerHTML = translations[currentLang][node.dataset.i18n];
  });
  document.documentElement.lang = currentLang === "pt" ? "pt-BR" : currentLang;
}

function renderSection(sectionKey) {
  currentSection = sectionKey;
  const section = catalog[sectionKey];
  document.querySelectorAll(".top-nav a").forEach((link) => link.classList.toggle("active", link.dataset.section === sectionKey));
  content.innerHTML = `
    <article id="${sectionKey}">
      <div class="section-banner ${section.bannerClass}"><h2>${section.title}</h2></div>
      ${section.groups.map((group) => `
        <details class="accordion" ${group.open ? "open" : ""}>
          <summary>${localize(group.label)}</summary>
          ${group.items.length ? `<div class="card-grid">${group.items.map((item, index) => `
            <button class="cover-card" data-group="${group.id}" data-index="${index}">
              <img src="${item.cover}" alt="${item.title}" loading="lazy" />
              <strong>${item.title}</strong>
            </button>`).join("")}</div>` : `<p class="empty">${translations[currentLang].empty}</p>`}
        </details>`).join("")}
    </article>`;
}

function openItem(groupId, index) {
  const section = catalog[currentSection];
  const item = section.groups.find((group) => group.id === groupId).items[index];
  modalCover.src = item.cover;
  modalCover.alt = item.title;
  modalTitle.textContent = item.title;
  modalDescription.textContent = localize(item.description);
  modalTags.innerHTML = item.tags.map((tag) => `<span>${tag}</span>`).join("");
  modalAction.textContent = localize(section.action);
  modalAction.href = item.link;
  modal.showModal();
}

document.querySelectorAll(".top-nav a").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    renderSection(link.dataset.section);
    history.replaceState(null, "", `#${link.dataset.section}`);
  });
});

document.querySelectorAll(".lang-button").forEach((button) => {
  button.addEventListener("click", () => {
    currentLang = supportedLanguages.includes(button.dataset.lang) ? button.dataset.lang : "pt";
    document.querySelectorAll(".lang-button").forEach((item) => item.classList.toggle("active", item === button));
    applyTranslations();
    renderSection(currentSection);
  });
});

content.addEventListener("click", (event) => {
  const card = event.target.closest(".cover-card");
  if (card) openItem(card.dataset.group, Number(card.dataset.index));
});

document.querySelector(".modal-close").addEventListener("click", () => modal.close());
modal.addEventListener("click", (event) => {
  if (event.target === modal) modal.close();
});

fetch("catalog.json")
  .then((response) => response.json())
  .then((data) => {
    catalog = data;
    const initial = location.hash.replace("#", "");
    applyTranslations();
    renderSection(catalog[initial] ? initial : "games");
  })
  .catch(() => {
    content.innerHTML = '<p class="empty">Não foi possível carregar catalog.json.</p>';
  });
