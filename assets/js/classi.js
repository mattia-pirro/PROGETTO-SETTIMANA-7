export class Squadra {
  constructor(dati) {
    this.id = dati.idTeam;
    this.nome = dati.strTeam;
    this.logo = dati.strBadge;
    this.lega = dati.strLeague;
    this.paese = dati.strCountry;
  }
}

export class Evento {
  constructor(dati) {
    this.id = dati.idEvent;
    this.data = dati.dateEvent;
    this.casa = dati.strHomeTeam;
    this.trasferta = dati.strAwayTeam;
    this.punteggioCasa = dati.intHomeScore;
    this.punteggioTrasferta = dati.intAwayScore;
  }

  formattaData() {
    return new Date(this.data).toLocaleDateString("it-IT", {
      dateStyle: "long",
    });
  }

  punteggio() {
    if (this.punteggioCasa === null || this.punteggioTrasferta === null) {
      return "-";
    }
    return `${this.punteggioCasa} - ${this.punteggioTrasferta}`;
  }
}
