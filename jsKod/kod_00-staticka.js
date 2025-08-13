class Postavke {

  constructor() {
    if (this instanceof Postavke) {
      throw new Error("Statička klasa nema instance!");
    }
  }

  /** @type {Racoon} */
  static racoon;

  /** @type {Coin} */
  static coin;

  /** @type {Projektil} */
  static projektil;

    /** @type {Item} */
    static kutija;

  /** @type {Glavni} */
  static glavni;

  static Ljestve_pomoc = [];
  static coins = [];
  static vatra = [];
  static blago = [];
  static kraj = [];
  static golem = [];

  static bodovi = 0;

  static random(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  static projektili = [];
  static losi_projektili = [];

  static dno = 9 * 64;

  static ukloniProjektil(p){
    for (let i = Postavke.projektili.length - 1; i >= 0; i--) {
      if (Postavke.projektili[i] === p) {
        Postavke.projektili.splice(i, 1); // brisanje i-tog elementa       
        console.log("uk");
        break; 
      }
    }

    for (let i = Postavke.losi_projektili.length - 1; i >= 0; i--) {
      if (Postavke.losi_projektili[i] === p) {
        Postavke.losi_projektili.splice(i, 1); // brisanje i-tog elementa       
        console.log("uk");
        break; 
      }
    }
  }

}