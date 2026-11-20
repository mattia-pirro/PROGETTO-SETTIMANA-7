import { Evento } from "./classi.js";
import {
  getJSON,
  mostraSpinner,
  nascondiSpinner,
  mostraErrore,
} from "./risultati.js";

const LAST_MATCH_URL =
  "https://www.thesportsdb.com/api/v1/json/123/eventslast.php";
const NEXT_MATCH_URL =
  "https://www.thesportsdb.com/api/v1/json/123/eventsnext.php";
const dettagli = document.querySelector("#dettagli-section .card-grid");
let controller;

export async function cercaPartite(teamId) {
  if (controller) {
    controller.abort();
    controller = null;
  }

  if (!teamId) {
    nascondiSpinner();
    return null;
  }

  controller = new AbortController();
  const { signal } = controller;

  mostraSpinner();

  const urlLast = new URL(LAST_MATCH_URL);
  urlLast.searchParams.set("id", teamId);

  const urlNext = new URL(NEXT_MATCH_URL);
  urlNext.searchParams.set("id", teamId);

  try {
    const [lastMatch, nextMatch] = await Promise.allSettled([
      getJSON(urlLast, { signal }),
      getJSON(urlNext, { signal }),
    ]);

    if (signal.aborted) {
      return null;
    }

    let last = null;
    if (
      lastMatch.status === "fulfilled" &&
      lastMatch.value.results?.length > 0
    ) {
      last = new Evento(lastMatch.value.results[0]);
    }

    let next = null;
    if (
      nextMatch.status === "fulfilled" &&
      nextMatch.value.events?.length > 0
    ) {
      next = new Evento(nextMatch.value.events[0]);
    }

    return { last, next };
  } catch (err) {
    if (err.name === "AbortError" || signal.aborted) {
      return null;
    }
    mostraErrore(err.message);
    return { last: null, next: null };
  } finally {
    if (!signal.aborted) {
      nascondiSpinner();
    }
  }
}

export function renderDettagli(nomeSquadra, { last, next }) {
  dettagli.textContent = "";

  const card = document.createElement("div");
  card.className =
    "card border-0 shadow rounded-3 p-4 pb-md-3 d-flex flex-column w-100";

  const divTitle = document.createElement("div");
  divTitle.className = "div-title w-100 mb-3";

  const teamTitle = document.createElement("h4");
  teamTitle.className = "fw-bold fs-4 team-title mb-4 card-title";
  teamTitle.textContent = nomeSquadra;

  divTitle.appendChild(teamTitle);

  const row = document.createElement("div");
  row.className = "d-flex flex-column flex-md-row w-100 gap-3 pe-md-2";

  const divNextMatch = document.createElement("div");
  divNextMatch.className = "col-12 col-md-6 mb-4 pe-md-3";

  const titleSectionNext = document.createElement("h6");
  titleSectionNext.className =
    "fw-bold text-white section-header mb-4 titolo-sezione fs-5 pb-2";
  titleSectionNext.textContent = "Prossimi eventi";

  divNextMatch.appendChild(titleSectionNext);

  if (!next) {
    const nonTrovatoNext = document.createElement("p");
    nonTrovatoNext.className = "fst-italic text-white p-0 m-0 fs-6";
    nonTrovatoNext.textContent = "Nessun evento in programma";
    divNextMatch.appendChild(nonTrovatoNext);
  } else {
    const matchRowNext = document.createElement("div");
    matchRowNext.className = "match-row pb-1";

    const dataNext = document.createElement("p");
    dataNext.className = "text-secondary mb-1 fs-6";
    dataNext.textContent = next.formattaData();

    const titoloNext = document.createElement("p");
    titoloNext.className = "text-white p-0 m-0 fs-6";
    titoloNext.textContent = `${next.casa} - ${next.trasferta}`;

    matchRowNext.appendChild(dataNext);
    matchRowNext.appendChild(titoloNext);
    divNextMatch.appendChild(matchRowNext);
  }

  const divLastMatch = document.createElement("div");
  divLastMatch.className = "col-12 col-md-6 pe-md-3";

  const titleSectionLast = document.createElement("h6");
  titleSectionLast.className =
    "fw-bold text-white section-header mb-4 titolo-sezione fs-5 pb-2";
  titleSectionLast.textContent = "Ultimi risultati";

  divLastMatch.appendChild(titleSectionLast);

  if (!last) {
    const nonTrovatoLast = document.createElement("p");
    nonTrovatoLast.className = "fst-italic text-white p-0 m-0 fs-6";
    nonTrovatoLast.textContent = "Nessun risultato disponibile";
    divLastMatch.appendChild(nonTrovatoLast);
  } else {
    const matchRowLast = document.createElement("div");
    matchRowLast.className = "match-row pb-1";

    const dataLast = document.createElement("p");
    dataLast.className = "text-secondary mb-1 fs-6";
    dataLast.textContent = last.formattaData();

    const divScore = document.createElement("div");
    divScore.className = "d-flex align-items-center gap-2";

    const titoloLast = document.createElement("p");
    titoloLast.className = "text-white p-0 m-0 fs-6";
    titoloLast.textContent = `${last.casa} - ${last.trasferta}`;

    const badgeScore = document.createElement("p");
    badgeScore.className = "badge badge-score bg-secondary m-0 fs-6";
    badgeScore.textContent = last.punteggio();

    divScore.appendChild(titoloLast);
    divScore.appendChild(badgeScore);
    matchRowLast.appendChild(dataLast);
    matchRowLast.appendChild(divScore);
    divLastMatch.appendChild(matchRowLast);
  }

  row.appendChild(divNextMatch);
  row.appendChild(divLastMatch);

  card.appendChild(divTitle);
  card.appendChild(row);
  dettagli.appendChild(card);
}

export function svuotaDettagli() {
  dettagli.textContent = "";
}
