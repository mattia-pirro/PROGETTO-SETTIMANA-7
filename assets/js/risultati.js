import { Squadra } from "./classi.js";

const DB_URL = "https://www.thesportsdb.com/api/v1/json/123/searchteams.php";

const form = document.querySelector("#search-form");
const search = document.querySelector("#search");
const spinner = document.querySelector("#spinner");
const errore = document.querySelector("#alert");
const risultati = document.querySelector("#risultati-section .card-grid");
let controller;
let timeoutId;

function mostraSpinner() {
  spinner.hidden = false;
  errore.hidden = true;
}

function nascondiSpinner() {
  spinner.hidden = true;
}

function mostraErrore(msg) {
  errore.textContent = "Errore: " + msg;
  errore.hidden = false;
}

async function getJSON(url, opzioni) {
  const response = await fetch(url, opzioni);

  if (!response.ok) {
    throw new Error(`Errore HTTP ${response.status}`);
  }

  return response.json();
}

async function cercaSquadra(query) {
  if (controller) {
    controller.abort();
  }
  controller = new AbortController();
  const { signal } = controller;

  mostraSpinner();

  const url = new URL(DB_URL);
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

function renderSquadra(teams) {
  errore.hidden = true;
  risultati.textContent = "";

  if (!teams) {
    const nonTrovata = document.createElement("p");
    nonTrovata.className = "text-center fs-5 text-white my-3 p-0 mx-0";
    if (teams === null) {
      nonTrovata.textContent = "Nessuna squadra trovata";
    } else {
      nonTrovata.textContent = "Inizia a cercare la tua squadra";
    }
    risultati.appendChild(nonTrovata);
    return;
  }

  teams.forEach((squadraTrovata) => {
    const squadra = new Squadra(squadraTrovata);

    const article = document.createElement("article");
    article.className = "card-container w-100";

    const card = document.createElement("div");
    card.className = "card h-100 border-0 rounded-3 w-100";

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
    btnPreferiti.className = "btn border-2 mt-3 w-100 fw-bold";
    btnPreferiti.type = "button";
    btnPreferiti.textContent = "⭐ Aggiungi ai preferiti";

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
    nascondiSpinner();
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
    return;
  }

  cercaSquadra(query);
});

renderSquadra();
