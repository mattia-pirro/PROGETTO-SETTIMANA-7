import { cercaPartite, renderDettagli, svuotaDettagli } from "./dettagli.js";
import { svuotaRisultati, resetBtnPreferiti } from "./risultati.js";

const CHIAVE_PREFERITI = "preferiti";

const preferiti = document.querySelector("#preferiti-section .card-grid");

function salvaPreferiti(preferiti) {
  localStorage.setItem(CHIAVE_PREFERITI, JSON.stringify(preferiti));
}

function leggiPreferiti() {
  try {
    const salvati = localStorage.getItem(CHIAVE_PREFERITI);
    return JSON.parse(salvati ?? "[]");
  } catch (err) {
    return [];
  }
}

export function isPreferito(id) {
  const squadraTrovata = leggiPreferiti().find((squadra) => {
    return squadra.id === id;
  });

  const preferita = Boolean(squadraTrovata);
  return preferita;
}

export function aggiungiPreferito(squadra) {
  const preferiti = leggiPreferiti();

  if (
    preferiti.find((preferita) => {
      return preferita.id === squadra.id;
    })
  ) {
    return;
  }

  preferiti.push(squadra);
  salvaPreferiti(preferiti);
}

function rimuoviPreferito(id) {
  const preferiti = leggiPreferiti().filter((squadra) => {
    return squadra.id !== id;
  });
  salvaPreferiti(preferiti);
}

export function renderPreferiti() {
  const lista = leggiPreferiti();
  preferiti.textContent = "";

  if (lista.length === 0) {
    const nonTrovata = document.createElement("p");
    nonTrovata.className =
      "text-center fs-6 fst-italic text-white my-3 p-0 mx-0";
    nonTrovata.textContent =
      "Cerca una squadra qui sopra, salvala e aggiungila ai preferiti.";
    preferiti.appendChild(nonTrovata);
    return;
  }

  lista.forEach((squadra) => {
    const article = document.createElement("article");
    article.className = `card-container col-12 col-md-6 col-xl-4`;

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

    const btnRimuovi = document.createElement("button");
    btnRimuovi.className = "btn border-2 btn-outline-danger mt-3 w-100 fw-bold";
    btnRimuovi.type = "button";
    btnRimuovi.textContent = "🗑️ Rimuovi";

    btnRimuovi.addEventListener("click", () => {
      if (card.classList.contains("selected")) {
        svuotaDettagli();
      }
      rimuoviPreferito(squadra.id);
      renderPreferiti();
      resetBtnPreferiti(squadra.id);
    });

    card.addEventListener("click", async (e) => {
      if (e.target.closest("button")) {
        return;
      }

      svuotaRisultati(squadra.id);

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
    cardBody.appendChild(btnRimuovi);
    card.appendChild(cardBody);
    article.appendChild(card);
    preferiti.appendChild(article);
  });
}

renderPreferiti();
