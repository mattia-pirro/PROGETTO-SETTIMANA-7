import { Squadra } from "./classi.js";
import { cercaPartite, renderDettagli, svuotaDettagli } from "./dettagli.js";
import {
  aggiungiPreferito,
  renderPreferiti,
  isPreferito,
} from "./preferiti.js";

const TEAM_URL = "https://www.thesportsdb.com/api/v1/json/123/searchteams.php";

const form = document.querySelector("#search-form");
const search = document.querySelector("#search");
const spinner = document.querySelector("#spinner");
const errore = document.querySelector("#alert");
export const risultati = document.querySelector(
  "#risultati-section .card-grid",
);
let controller;
let timeoutId;

export function mostraSpinner() {
  spinner.hidden = false;
  errore.hidden = true;
}

export function nascondiSpinner() {
  spinner.hidden = true;
}

export function mostraErrore(msg) {
  errore.textContent = "Errore: " + msg;
  errore.hidden = false;
}

export async function getJSON(url, opzioni) {
  const response = await fetch(url, opzioni);

  if (!response.ok) {
    throw new Error(`Errore HTTP ${response.status}`);
  }

  return response.json();
}

async function cercaSquadra(query) {
  if (controller) {
    controller.abort();
    controller = null;
  }

  controller = new AbortController();
  const { signal } = controller;

  errore.hidden = true;
  svuotaDettagli();
  document.querySelectorAll(".card.selected").forEach((selected) => {
    selected.classList.remove("selected");
  });

  mostraSpinner();

  const url = new URL(TEAM_URL);
  url.searchParams.set("t", query);

  try {
    const data = await getJSON(url, { signal });
    if (signal.aborted) {
      return;
    }
    renderSquadra(data.teams);
  } catch (err) {
    if (err.name === "AbortError" || signal.aborted) {
      return;
    }
    risultati.replaceChildren();
    mostraErrore(err.message);
  } finally {
    if (!signal.aborted) {
      nascondiSpinner();
    }
  }
}

function renderSquadra(squadra) {
  errore.hidden = true;
  risultati.textContent = "";
  svuotaDettagli();
  document.querySelectorAll(".card.selected").forEach((selected) => {
    selected.classList.remove("selected");
  });

  if (!squadra || squadra.length === 0) {
    const nonTrovata = document.createElement("p");
    nonTrovata.className =
      "text-center fs-6 fst-italic text-white my-3 p-0 mx-0";
    if (squadra === null) {
      nonTrovata.textContent = "Nessuna squadra trovata";
    } else {
      nonTrovata.textContent = "Cerca la tua squadra";
    }
    risultati.appendChild(nonTrovata);
    return;
  }

  squadra.forEach((squadraTrovata) => {
    const squadra = new Squadra(squadraTrovata);

    const article = document.createElement("article");
    article.className = "card-container w-100";
    article.dataset.teamId = squadra.id;

    const card = document.createElement("div");
    card.className = "card h-100 rounded-3 w-100";

    const cardBody = document.createElement("div");
    cardBody.className = "card-body text-center p-4 w-100";

    const img = document.createElement("img");
    img.className = "card-img-top";
    img.src = squadra.logo;
    img.alt = squadra.nome;

    const nome = document.createElement("h5");
    nome.className = "card-title fw-bold m-0 mt-3";
    nome.textContent = squadra.nome;

    const lega = document.createElement("p");
    lega.className = "card-text text-white m-0 mt-2";
    lega.textContent = squadra.lega;

    const paese = document.createElement("p");
    paese.className = "card-text text-white m-0 mt-1";
    paese.textContent = squadra.paese;

    const btnPreferiti = document.createElement("button");
    btnPreferiti.type = "button";
    btnPreferiti.dataset.teamId = squadra.id;

    if (isPreferito(squadra.id)) {
      btnPreferiti.textContent = "✓ Già nei preferiti";
      btnPreferiti.className = "btn border-2 mt-3 w-100 fw-bold preferito";
      btnPreferiti.disabled = true;
    } else {
      btnPreferiti.textContent = "⭐ Aggiungi ai preferiti";
      btnPreferiti.className = "btn border-2 mt-3 w-100 fw-bold";
    }

    btnPreferiti.addEventListener("click", () => {
      aggiungiPreferito(squadra);
      btnPreferiti.textContent = "✓ Già nei preferiti";
      btnPreferiti.className = "btn border-2 mt-3 w-100 fw-bold preferito";
      btnPreferiti.disabled = true;
      renderPreferiti();
    });

    card.addEventListener("click", async (e) => {
      if (e.target.closest("button")) {
        return;
      }

      const selezionato = card.classList.contains("selected");
      const allCard = document.querySelectorAll(".card.selected");

      allCard.forEach((selected) => {
        selected.classList.remove("selected");
      });

      if (selezionato) {
        cercaPartite(null);
        svuotaDettagli();
      } else {
        card.classList.add("selected");
        const partite = await cercaPartite(squadra.id);
        if (!partite || !card.classList.contains("selected")) {
          return;
        }
        renderDettagli(squadra.nome, partite);
      }
    });

    cardBody.appendChild(img);
    cardBody.appendChild(nome);
    cardBody.appendChild(lega);
    cardBody.appendChild(paese);
    cardBody.appendChild(btnPreferiti);
    card.appendChild(cardBody);
    article.appendChild(card);
    risultati.appendChild(article);
  });
}

search.addEventListener("input", (e) => {
  const query = e.target.value.trim();
  clearTimeout(timeoutId);

  if (!query) {
    if (controller) {
      controller.abort();
    }
    errore.hidden = true;
    nascondiSpinner();
    svuotaDettagli();
    renderSquadra();
    return;
  }

  timeoutId = setTimeout(function () {
    cercaSquadra(query);
  }, 400);
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  clearTimeout(timeoutId);
  const query = search.value.trim();

  if (!query) {
    if (controller) {
      controller.abort();
    }
    errore.hidden = true;
    nascondiSpinner();
    svuotaDettagli();
    renderSquadra();
    return;
  }

  cercaSquadra(query);
});

export function svuotaRisultati(teamId) {
  const articles = risultati.querySelectorAll("article");

  if (articles.length === 0) {
    risultati.textContent = "";
    const nonTrovata = document.createElement("p");
    nonTrovata.className =
      "text-center fs-6 fst-italic text-white my-3 p-0 mx-0";
    nonTrovata.textContent = "Cerca la tua squadra";
    risultati.appendChild(nonTrovata);
    return;
  }

  if (teamId) {
    const cardDaTenere = risultati.querySelector(
      `article[data-team-id="${teamId}"]`,
    );

    if (cardDaTenere) {
      articles.forEach((art) => {
        if (art !== cardDaTenere) {
          art.remove();
        }
      });
      return;
    }
  }

  risultati.textContent = "";
  const nonTrovata = document.createElement("p");
  nonTrovata.className = "text-center fs-6 fst-italic text-white my-3 p-0 mx-0";
  nonTrovata.textContent = "Cerca la tua squadra";
  risultati.appendChild(nonTrovata);
}

export function resetBtnPreferiti(teamId) {
  const btn = document.querySelector(
    `#risultati-section button[data-team-id="${teamId}"]`,
  );

  if (!btn) {
    return;
  }

  btn.textContent = "⭐ Aggiungi ai preferiti";
  btn.className = "btn border-2 mt-3 w-100 fw-bold";
  btn.disabled = false;
}

renderSquadra();
