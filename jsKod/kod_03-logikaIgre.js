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
/// <reference path="kod_02-postavke.js"/>

/**
 * Promjena stanja likova - interakcije
 */
function update_main() {

  if (GAME.activeWorldMap.name == "vjezbe9")
    vjezbe9();
  else if (GAME.activeWorldMap.name == "v10")
    vjezbe10();
  else if (GAME.activeWorldMap.name == "Mapa1")
    Mapa1();
  else if (GAME.activeWorldMap.name == "Mapa2")
    //btnStart.style.display = "inline-block"; // sakrij Start button
    Mapa2();

  GAME.update();

};

function vjezbe10() {
  if (SENSING.left.active) {
    Postavke.racoon.moveLeft();
  }

  if (SENSING.right.active) {
    Postavke.racoon.moveRight();
  }

  if (SENSING.up.active) {
    Postavke.racoon.jump();
  }

  if (SENSING.keyD.active) {
    // ovo je da ne puca cijelo vrijeme dok je pritisnuta tipka
    if (!Postavke.racoon.puca) {
      Postavke.racoon.puca = true;
      Postavke.racoon.pucaj();
    }
  }
  else {
    Postavke.racoon.puca = false;
  }

  // Projvjeri za svaki od projektila!
  for (let i = 0; i < Postavke.projektili.length; i++) {
    const p = Postavke.projektili[i];
    if(p.touching(Postavke.kutija)){
      p.stop();
      Postavke.kutija.visible = false;
      break;
    }
  }

}

function vjezbe9() {

  if (SENSING.left.active) {
    Postavke.racoon.moveLeft();
  }

  if (SENSING.right.active) {
    Postavke.racoon.moveRight();
  }

  if (SENSING.up.active) {
    Postavke.racoon.jump();
  }



}

function touchingLjestve(glavni) {
  // Dohvati layer "Ljestve"
  let ljestveLayer = GAME.getLayer("Ljestve");
  if (!ljestveLayer) return false;

  // Izračunaj tile indekse na kojima se nalazi Glavni (može pokrivati više tileova)
  let left = Math.floor(glavni.x / ljestveLayer.tilewidth);
  let right = Math.floor((glavni.x + glavni.width - 1) / ljestveLayer.tilewidth);
  let top = Math.floor(glavni.y / ljestveLayer.tileheight);
  let bottom = Math.floor((glavni.y + glavni.height - 1) / ljestveLayer.tileheight);

  // Provjeri sve tileove koje Glavni pokriva
  for (let tx = left; tx <= right; tx++) {
    for (let ty = top; ty <= bottom; ty++) {
      let idx = ty * ljestveLayer.width + tx;
      if (ljestveLayer.data[idx] && ljestveLayer.data[idx] !== 0) {
        return true;
      }
    }
  }
  return false;
}

function glavniNaLjestvePomoc(glavni) {
  // Dohvati layer "Ljestve_pomoc" (objectgroup)
  let ljestvePomocLayer = GAME.getLayer("Ljestve_pomoc");
  if (!ljestvePomocLayer || !ljestvePomocLayer.objects) return false;

  // Provjeri za svaki objekt u layeru "Ljestve_pomoc" je li Glavni na njemu
  for (let i = 0; i < ljestvePomocLayer.objects.length; i++) {
    const obj = ljestvePomocLayer.objects[i];
    // Tiled object y je na dnu objekta, a ne na vrhu!
    let objTop = obj.y - obj.height;
    let objBottom = obj.y;
    let objLeft = obj.x;
    let objRight = obj.x + obj.width;
    // Provjera preklapanja (AABB collision)
    if (
      glavni.x + glavni.width > objLeft &&
      glavni.x < objRight &&
      glavni.y + glavni.height > objTop &&
      glavni.y < objBottom
    ) {
      return true;
    }
  }
  return false;
}

// Nova metoda: teleportacija na vrh objekta iz Postavke.Ljestve_pomoc i stajanje na njemu
function provjeriLjestvePomocTeleport(glavni) {
  if (!Postavke.Ljestve_pomoc || Postavke.Ljestve_pomoc.length === 0) return false;

  for (let i = 0; i < Postavke.Ljestve_pomoc.length; i++) {
    const obj = Postavke.Ljestve_pomoc[i];
    // Pretpostavljamo da su x, y, width, height ispravno postavljeni za objekte
    let objTop = obj.y;
    let objBottom = obj.y + obj.height;
    let objLeft = obj.x;
    let objRight = obj.x + obj.width;

    let glavniBottom = glavni.y + glavni.height;
    let tolerance = 4;
    // Provjera: dno Glavnog dodiruje vrh objekta (objTop)
    if (
      glavniBottom >= objTop - tolerance &&
      glavniBottom <= objTop + tolerance &&
      glavni.x + glavni.width > objLeft &&
      glavni.x < objRight
    ) {
      // Teleportiraj Glavnog na vrh objekta
      glavni.y = objTop - glavni.height;
      glavni.velocity_y = 0;
      glavni.jumping = false;
      glavni._naLjestvePomocObjekt = obj;
      return true;
    }
  }
  return false;
}

// Nova metoda: teleportacija natrag na ljestve ako pritisne dolje
function provjeriSilazakSLjestvePomoc(glavni) {
  if (!glavni._naLjestvePomocObjekt) return false;
  if (SENSING.down.active) {
    let ljestveLayer = GAME.getLayer("Ljestve");
    if (!ljestveLayer) {
      console.warn("Ljestve tilelayer nije pronađen!");
      return false;
    }
    let obj = glavni._naLjestvePomocObjekt;

    // Provjeri je li Glavni stvarno stoji na objektu ljestve_pomoc (AABB collision)
    let objTop = obj.y;
    let objBottom = obj.y + obj.height;
    let objLeft = obj.x;
    let objRight = obj.x + obj.width;
    let glavniBottom = glavni.y + glavni.height;
    let glavniTop = glavni.y;
    let glavniLeft = glavni.x;
    let glavniRight = glavni.x + glavni.width;

    // Mora biti dovoljno preklapanje po x i y (stoji na objektu)
    let overlapX = glavniRight > objLeft && glavniLeft < objRight;
    let overlapY = glavniBottom > objTop && glavniTop < objBottom;

    if (!(overlapX && overlapY)) {
      // Nije na objektu, ne teleportiraj
      return false;
    }

    // Sredina objekta po x
    let tileX = Math.floor((obj.x + obj.width / 2) / ljestveLayer.tilewidth);
    // Prvi tile ispod objekta
    let tileY = Math.floor((obj.y + obj.height) / ljestveLayer.tileheight);

    for (let ty = tileY; ty < ljestveLayer.height; ty++) {
      let idx = ty * ljestveLayer.width + tileX;
      if (ljestveLayer.data[idx] && ljestveLayer.data[idx] !== 0) {
        glavni.x = tileX * ljestveLayer.tilewidth;
        glavni.y = ty * ljestveLayer.tileheight - glavni.height + ljestveLayer.tileheight / 2;
        glavni._naLjestvePomocObjekt = null;
        return true;
      }
    }
  }
  return false;
}

function BrojGolema(c) {
  let s = "";
  if (typeof arguments[0] == "string") {
    GameSettings.output("Nema golema na mapi", true);
  }
  else if(typeof arguments[0] == "number") {
    for (let i = 0; i < c; i++) {
      s += "Golem " + (i + 1) + " ima " + Postavke.golem[i].health + " zdravlja\n";
    }
    GameSettings.output(s, true);
  }
  else {
    GameSettings.output("Neispravan tip argumenta. Očekivano je string ili broj.", true);
  }
}

function Mapa1() {
  let glavni = Postavke.glavni;

  // Prvo provjeri silazak s objekta ljestve_pomoc
  if (provjeriSilazakSLjestvePomoc(glavni)) {
    GAME.activeWorldMap.gravity = 0;
    if (SENSING.up.active) glavni.y -= 3;
    if (SENSING.down.active) glavni.y += 3;
    if (SENSING.left.active) glavni.moveLeft();
    if (SENSING.right.active) glavni.moveRight();
    return;
  }

  // Provjeri teleportaciju na objekt ljestve_pomoc
  let naLjestvePomoc = provjeriLjestvePomocTeleport(glavni);

  let naLjestvama = touchingLjestve(glavni);

  if (naLjestvePomoc) {
    GAME.activeWorldMap.gravity = 2;
    glavni.velocity_y = 0;
    glavni.jumping = false;
    if (SENSING.up.active) glavni.jump();
    //console.log("DEBUG: Glavni stoji na objektu iz Ljestve_pomoc");
  } else if (naLjestvama) {
    GAME.activeWorldMap.gravity = 0;
    if (SENSING.up.active) glavni.y -= 3;
    if (SENSING.down.active) glavni.y += 3;
  } else {
    GAME.activeWorldMap.gravity = 2;
    if (SENSING.up.active) glavni.jump();
  }

  if (SENSING.left.active) glavni.moveLeft();
  if (SENSING.right.active) glavni.moveRight();

  // dodir - coins
  for (let i = 0; i < Postavke.coins.length; i++) {
    const coin = Postavke.coins[i];
    if (glavni.touching(coin)) {
      coin.visible = false;
      Postavke.coins.splice(i, 1);
      i--; 

      glavni.bodovi += coin.value;
      GameSettings.output("Bodovi: " + glavni.bodovi, true);
    }
  }

  // dodir blago
  for (let i = 0; i < Postavke.blago.length; i++) {
    const b = Postavke.blago[i];
    if (glavni.touching(b)) {
      b.visible = false;
      Postavke.blago.splice(i, 1);
      i--;
      glavni.bodovi += b.value;
      GameSettings.output("Bodovi: " + glavni.bodovi, true);
    }
  }

  // dodir vatra
  for (let i = 0; i < Postavke.vatra.length; i++) {
    const v = Postavke.vatra[i];
    if (glavni.touching(v) && !v.touched) {
      v.touched = true; 
      v.visible = false;
      Postavke.vatra.splice(i, 1);
      i--;
      glavni.health -= v.damage;

      
      if (glavni.health <= 0) {
        GameSettings.output("Kraj igre! Bodovi: " + glavni.bodovi, true);
        glavni.visible = false;
        btnGame.dispatchEvent(gameOverLose);
        //btnStop.click();
        return;
      }

      GameSettings.output("Zadobio si " + v.damage + " štete! Trenutno zdravlje: " + glavni.health, true);
    }
  }



  //dodir kraj
  for (let i = 0; i < Postavke.kraj.length; i++) {
    const k = Postavke.kraj[i];
    if (glavni.touching(k)) {
      GameSettings.output("Čestitamo! Kraj igre! Bodovi: " + glavni.bodovi, true);
      //btnStop.click();
      btnGame.dispatchEvent(levelUp);
      return;
    }
  }

  // pucaj projektil
  if (SENSING.keyD.active) {
    if (!glavni.puca) {
      glavni.puca = true;
      glavni.pucaj();
    }
  } else {
    glavni.puca = false;
  }
  // golem puca svake 3 sekunde
  for (let i = 0; i < Postavke.golem.length; i++) {
    const golem = Postavke.golem[i];
    if (!golem.puca && Postavke.golem.includes(golem)) {
      golem.puca = true; 
      
      golem.timeoutId = setTimeout(() => {
        if (Postavke.golem.includes(golem) && golem.visible) {
          golem.pucaj();
        }
        golem.puca = false;
      }, 3000);
      
    }
  }

  for (let i = 0; i < Postavke.projektili.length; i++) {
    const p = Postavke.projektili[i];
    for (let j = 0; j < Postavke.golem.length; j++) {
      const golem = Postavke.golem[j];
      golem.visible = true;      
      if (p.touching(golem)) {
        golem.health -= p.damage;
        p.stop();
        // Otkaži timeout prije uklanjanja golema
        if (golem.timeoutId) {
          clearTimeout(golem.timeoutId);
        }
        golem.visible = false;
        Postavke.golem.splice(j, 1);
        j--;
        Postavke.glavni.bodovi += golem.value;
        GameSettings.output("Pogodio si golema! Bodovi: " + Postavke.glavni.bodovi, true);
        break; 
      }
    }
  }

  for (let i = 0; i < Postavke.losi_projektili.length; i++) {
    const p = Postavke.losi_projektili[i];
    if(Postavke.golem.length != 0)
    {
      var damage = Postavke.golem[0].damage;
    }
    if (p.touching(Postavke.glavni) && !p.touched) {
      p.stop();
      p.touched = true;
      Postavke.glavni.health -= damage;
      

      if (glavni.health <= 0) {
        GameSettings.output("Kraj igre! Bodovi: " + glavni.bodovi, true);
        glavni.visible = false;
        btnGame.dispatchEvent(gameOverLose);
        //btnStop.click();;
        return;
      }

      GameSettings.output("Zadobio si " + damage + " štete! Trenutno zdravlje: " + Postavke.glavni.health, true);
    }
  }

  if (Postavke.golem.length > 0) {
    var c = Postavke.golem.length;
  }
  else {
    var c = "prazno";
  }

  if (SENSING.keyA.down) {
    BrojGolema(c);
  }

}

function Mapa2() {
  let glavni = Postavke.glavni;

  // Prvo provjeri silazak s objekta ljestve_pomoc
  if (provjeriSilazakSLjestvePomoc(glavni)) {
    GAME.activeWorldMap.gravity = 0;
    if (SENSING.up.active) glavni.y -= 3;
    if (SENSING.down.active) glavni.y += 3;
    if (SENSING.left.active) glavni.moveLeft();
    if (SENSING.right.active) glavni.moveRight();
    return;
  }

  // Provjeri teleportaciju na objekt ljestve_pomoc
  let naLjestvePomoc = provjeriLjestvePomocTeleport(glavni);

  let naLjestvama = touchingLjestve(glavni);

  if (naLjestvePomoc) {
    GAME.activeWorldMap.gravity = 2;
    glavni.velocity_y = 0;
    glavni.jumping = false;
    if (SENSING.up.active) glavni.jump();
    //console.log("DEBUG: Glavni stoji na objektu iz Ljestve_pomoc");
  } else if (naLjestvama) {
    GAME.activeWorldMap.gravity = 0;
    if (SENSING.up.active) glavni.y -= 3;
    if (SENSING.down.active) glavni.y += 3;
  } else {
    GAME.activeWorldMap.gravity = 2;
    if (SENSING.up.active) glavni.jump();
  }

  if (SENSING.left.active) glavni.moveLeft();
  if (SENSING.right.active) glavni.moveRight();

  // dodir - coins
  for (let i = 0; i < Postavke.coins.length; i++) {
    const coin = Postavke.coins[i];
    if (glavni.touching(coin)) {
      coin.visible = false;
      Postavke.coins.splice(i, 1);
      i--; 

      glavni.bodovi += coin.value*2;
      GameSettings.output("Bodovi: " + glavni.bodovi, true);
    }
  }

  // dodir blago
  for (let i = 0; i < Postavke.blago.length; i++) {
    const b = Postavke.blago[i];
    if (glavni.touching(b)) {
      b.visible = false;
      Postavke.blago.splice(i, 1);
      i--;
      glavni.bodovi += b.value;
      GameSettings.output("Bodovi: " + glavni.bodovi, true);

      
      for (let j = 0; j < Postavke.vatra.length; j++) {
        const v = Postavke.vatra[j];
        if (v.layer) {
          v.touched = true; 
          v.visible = false; 
          Postavke.vatra.splice(j, 1); 
          j--; 
          //GameSettings.output("Vatra " + v.layer.name + " je ugašena!", true);
        }
      }
    }
  }

  // dodir vatra
  for (let i = 0; i < Postavke.vatra.length; i++) {
    const v = Postavke.vatra[i];
    if (glavni.touching(v) && !v.touched) {
      v.touched = true; 
      v.visible = false;
      Postavke.vatra.splice(i, 1);
      i--;
      glavni.health -= v.damage;

      
      if (glavni.health <= 0) {
        GameSettings.output("Kraj igre! Bodovi: " + glavni.bodovi, true);
        glavni.visible = false;
        btnGame.dispatchEvent(gameOverLose);
        btnStart.style.display = "none";
        //btnStop.click();
        return;
      }

      GameSettings.output("Zadobio si " + v.damage + " štete! Trenutno zdravlje: " + glavni.health, true);
    }
  }



  //dodir kraj
  for (let i = 0; i < Postavke.kraj.length; i++) {
    const k = Postavke.kraj[i];
    if (glavni.touching(k)) {
      GameSettings.output("Čestitamo! Kraj igre! Bodovi: " + glavni.bodovi, true);
      //btnStop.click();
      btnGame.dispatchEvent(gameOverWin);
      alert("Čestitamo! Kraj igre!\nBodovi s drugog levela: " + glavni.bodovi + 
        "\nUkupno bodova: " + (glavni.bodovi + Postavke.bodovi));
      window.close();
      return;
    }
  }

  // pucaj projektil
  if (SENSING.keyD.active) {
    if (!glavni.puca) {
      glavni.puca = true;
      glavni.pucaj();
    }
  } else {
    glavni.puca = false;
  }
  // golem puca svake 3 sekunde
  for (let i = 0; i < Postavke.golem.length; i++) {
    const golem = Postavke.golem[i];
    if (!golem.puca) {
      golem.puca = true;
      
      golem.timeoutId = setTimeout(() => {
        
        if (Postavke.golem.includes(golem) && golem.visible) {
          golem.pucaj();
        }
        golem.puca = false; 
      }, 3000);
    }
  }

  for (let i = 0; i < Postavke.projektili.length; i++) {
    const p = Postavke.projektili[i];
    for (let j = 0; j < Postavke.golem.length; j++) {
      const golem = Postavke.golem[j];
      golem.visible = true;
      if (p.touching(golem)) {        
        p.stop();
        golem.health -= p.damage;
        if (golem.health <= 0) {
          
          if (golem.timeoutId) {
            clearTimeout(golem.timeoutId);
          }
          golem.visible = false;
          Postavke.golem.splice(j, 1);
          j--;
          Postavke.glavni.bodovi += golem.value*2;
          GameSettings.output("Pogodio si golema! Bodovi: " + Postavke.glavni.bodovi, true);
          break;
        }
      }
    }
  }

  for (let i = 0; i < Postavke.losi_projektili.length; i++) {
    const p = Postavke.losi_projektili[i];
    if(Postavke.golem.length != 0)
    {
      var damage = Postavke.golem[0].damage*2;
    }
    if (p.touching(Postavke.glavni) && !p.touched) {
      p.stop();
      p.touched = true;
      Postavke.glavni.health -= damage;
      

      if (glavni.health <= 0) {
        GameSettings.output("Kraj igre! Bodovi: " + glavni.bodovi, true);
        glavni.visible = false;
        btnGame.dispatchEvent(gameOverLose);
        btnStart.style.display = "none";
        //btnStop.click();;
        return;
      }
      GameSettings.output("Zadobio si " + damage + " štete! Trenutno zdravlje: " + Postavke.glavni.health, true);
    }
  }

  if (Postavke.golem.length > 0) {
    var c = Postavke.golem.length;
  }
  else {
    var c = "prazno";
  }

  if (SENSING.keyA.down) {
    BrojGolema(c);
  }
}