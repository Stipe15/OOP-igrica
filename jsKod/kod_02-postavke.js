//#region okvir
/// <reference path="../otter/lib-00-GameSettings.js"/>
/// <reference path="../otter/lib-01-tiled.js"/>
/// <reference path="../otter/lib-02-sensing.js"/>
/// <reference path="../otter/lib-03-display.js"/>
/// <reference path="../otter/lib-04-engine.js"/>
/// <reference path="../otter/lib-05-game.js"/>
/// <reference path="../otter/lib-06-main.js"/>
//#endregion
/// <reference path="kod_01-likovi.js"/>

const btnGame = document.getElementById("btnGame");
btnGame.addEventListener("gameover", kraj);
btnGame.addEventListener("levelup", setupMapa2);

const gameOverEvent = new Event("gameover");
const gameOverWin = new CustomEvent("gameover", {
  detail: { win: true }
})
const gameOverLose = new CustomEvent("gameover", {
  detail: { win: false }
});

const levelUp = new Event("levelup");

function kraj(ev){
  console.log("Kraj igre", ev);
  btnStop_click();
}

// što će se pokrenuti kad se klikne button Setup:
let btnSetupGame = document.getElementById("btnSetupGame");
btnSetupGame.addEventListener("click", setup);

function setup() {

  GAME.clearSprites();

  let odabrana = GAME.activeWorldMap.name;
  if (odabrana == "Mapa2") {
    GAME.setActiveWorldMap("Mapa1");
    odabrana = GAME.activeWorldMap.name;
  }
  GameSettings.output(odabrana);

  switch (odabrana) {
    case "vjezbe9":
      setupVjezbe9();
      break;

    case "v10":
      setupVjezbe10();
      break;

    case "Mapa1":
      setupMapa1();
      break;

    case "Mapa2":
      setupMapa2();
      break;

    default:
      throw "Ne postoji setup za " + GAME.activeWorldMap.name;
      break;
  }

  render_main();
}

/* LEVELS */
function setupVjezbe10() {
  GAME.clearSprites();

  GAME.activeWorldMap.setCollisions("platforme");

  Postavke.racoon = new Racoon(GAME.getSpriteLayer("racoon"));
  GAME.addSprite(Postavke.racoon);

  Postavke.kutija = new Item(GAME.getSpriteLayer("kutija"));
  Postavke.kutija.visible = true;
  GAME.addSprite(Postavke.kutija);

  Postavke.projektil = new Projektil(GAME.getSpriteLayer("projektil"));
  GAME.addSprite(Postavke.projektil);
}

function setupVjezbe9() {

  GAME.clearSprites();

  GAME.activeWorldMap.setCollisions("platforme");

  GameSettings.output("test");
  GameSettings.output("test2" ,true);

}

function setupMapa1() {

  btnStart.style.display = "inline-block";

  GAME.clearSprites();
  GAME.activeWorldMap.setCollisions("Platforma");
  
  Postavke.bodovi = 0;
  Postavke.Ljestve_pomoc = [];
  Postavke.coins = [];
  Postavke.vatra = [];
  Postavke.blago = [];
  Postavke.kraj = [];
  Postavke.golem = [];
  Postavke.projektili = [];
  Postavke.losi_projektili = [];

  let ljp = ["ljp1", "ljp2", "ljp3", "ljp4"];
  for (let i = 0; i < ljp.length; i++) {
    const layer = ljp[i];
    let l = new Ljestve_pomoc(GAME.getSpriteLayer(layer));
    l.visible = false;
    Postavke.Ljestve_pomoc.push(l);
    GAME.addSprite(l);
  }

  Postavke.glavni = new Glavni(GAME.getSpriteLayer("Glavni"));
  GAME.addSprite(Postavke.glavni);

  let coins = ["c1", "c2", "c3", "c4", "c5", "c6"];
  let vatra = ["v1", "v2", "v3", "v4", "v5"];
  let blago = ["Blago"];
  let krajTiles = ["End1",  "End2", "End3", "End4"];

  for (let i = 0; i < coins.length; i++) {
    const layer = coins[i];
    let c = new Coin(GAME.getSpriteLayer(layer));
    c.visible = true;
    Postavke.coins.push(c);
    GAME.addSprite(c);
  }

  for (let i = 0; i < vatra.length; i++) {
    const layer = vatra[i];
    let v = new Vatra(GAME.getSpriteLayer(layer));
    v.visible = true;
    Postavke.vatra.push(v);
    GAME.addSprite(v);
  }

  for (let i = 0; i < blago.length; i++) {
    const layer = blago[i];
    let b = new Blago(GAME.getSpriteLayer(layer));
    b.visible = true;
    Postavke.blago.push(b);
    GAME.addSprite(b);
  }

  for (let i = 0; i < krajTiles.length; i++) {
    const layer = krajTiles[i];
    let k = new Kraj(GAME.getSpriteLayer(layer));
    k.visible = true;
    Postavke.kraj.push(k);
    GAME.addSprite(k);
  }

  
  Postavke.golem = [];
  let golemLayer = GAME.getSpriteLayer("Golem");
  let golem1 = new Golem(golemLayer);
  golem1.visible = true;
  Postavke.golem.push(golem1);
  golem1.x = 28*64;  golem1.y = 5*64;
  GAME.addSprite(golem1);

  let golemLayer2 = Object.assign({}, golemLayer);
  let golem2 = new Golem(golemLayer2);
  Postavke.golem.push(golem2);
  golem2.visible = true;
  golem2.x = 12*64;  golem2.y = 14*64;
  golem2.direction = 90; 
  GAME.addSprite(golem2);

  let golemLayer3 = Object.assign({}, golemLayer);
  let golem3 = new Golem(golemLayer3);
  Postavke.golem.push(golem3);
  golem3.visible = true;
  golem3.x = 15*64;  golem3.y = 17*64;
  GAME.addSprite(golem3);
  

  Postavke.projektil = new Projektil(GAME.getSpriteLayer("Projektil"));
  GAME.addSprite(Postavke.projektil);
}

function setupMapa2() {

  GAME.setActiveWorldMap("Mapa2");
  btnStop_click();
  alert("Novi level\nBodovi s prvog levela: " + Postavke.glavni.bodovi);
  Postavke.bodovi = Postavke.glavni.bodovi;
  GAME.clearSprites();
  btnStart_click();
  
  GAME.activeWorldMap.setCollisions("Platforma");


  
  Postavke.Ljestve_pomoc = [];
  Postavke.coins = [];
  Postavke.vatra = [];
  Postavke.blago = [];
  Postavke.kraj = [];
  Postavke.golem = [];
  Postavke.projektili = [];
  Postavke.losi_projektili = [];

  

  let ljp = ["ljp1", "ljp2", "ljp3", "ljp4"];
  for (let i = 0; i < ljp.length; i++) {
    const layer = ljp[i];
    let l = new Ljestve_pomoc(GAME.getSpriteLayer(layer));
    l.visible = false;
    Postavke.Ljestve_pomoc.push(l);
    GAME.addSprite(l);
  }

  Postavke.glavni = new Glavni(GAME.getSpriteLayer("Glavni"));
  GAME.addSprite(Postavke.glavni);
  Postavke.glavni.x = 5 * 64; Postavke.glavni.y = 2 * 64;

  let coins = ["c1", "c2", "c3", "c4", "c5", "c6"];
  let vatra = ["v1", "v2", "v3", "v4", "v5", "v6", "v7", "v8", "v9"];
  let blago = ["Blago"];
  let krajTiles = ["End1",  "End2", "End3", "End4"];

  for (let i = 0; i < coins.length; i++) {
    const layer = coins[i];
    let c = new Coin(GAME.getSpriteLayer(layer));
    c.visible = true;
    Postavke.coins.push(c);
    GAME.addSprite(c);
  }

  for (let i = 0; i < vatra.length; i++) {
    const layer = vatra[i];
    let v = new Vatra(GAME.getSpriteLayer(layer));
    v.visible = true;
    Postavke.vatra.push(v);
    GAME.addSprite(v);
  }

  for (let i = 0; i < blago.length; i++) {
    const layer = blago[i];
    let b = new Blago(GAME.getSpriteLayer(layer));
    b.visible = true;
    Postavke.blago.push(b);
    GAME.addSprite(b);
  }

  for (let i = 0; i < krajTiles.length; i++) {
    const layer = krajTiles[i];
    let k = new Kraj(GAME.getSpriteLayer(layer));
    k.visible = true;
    Postavke.kraj.push(k);
    GAME.addSprite(k);
  }

  
  Postavke.golem = [];
  let pozicije_golema = [
    { x: 13*64, y: 2*64 , direction: 270},
    { x: 15*64, y: 7*64 , direction: 90},
    { x: 12*64, y: 12*64 , direction: 270},
    { x: 18*64, y: 12*64 , direction: 270},
    { x: 20*64, y: 17*64 , direction: 90},
    { x: 25*64, y: 17*64 , direction: 90},
  ]

  let golemLayer = GAME.getSpriteLayer("Golem");
  for (let i = 0; i < pozicije_golema.length; i++) {
    const pozicija = pozicije_golema[i];
    let golemL= Object.assign({}, golemLayer);
    let golem = new Golem(golemL);
    Postavke.golem.push(golem);
    golem.visible = true;
    golem.x = pozicija.x;
    golem.y = pozicija.y;
    golem.direction = pozicija.direction; 
    golem.health = 200; 
    GAME.addSprite(golem);
  }
  

  Postavke.projektil = new Projektil(GAME.getSpriteLayer("Projektil"));
  GAME.addSprite(Postavke.projektil);

  


}