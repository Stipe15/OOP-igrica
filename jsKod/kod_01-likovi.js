//#region okvir
/// <reference path="../otter/lib-00-GameSettings.js"/>
/// <reference path="../otter/lib-01-tiled.js"/>
/// <reference path="../otter/lib-02-sensing.js"/>
/// <reference path="../otter/lib-03-display.js"/>
/// <reference path="../otter/lib-04-engine.js"/>
/// <reference path="../otter/lib-05-game.js"/>
/// <reference path="../otter/lib-06-main.js"/>
//#endregion

class Animal extends Sprite {
  constructor(x, y, layer) {

    super(x + 4, y + 4, 64 - 8, 64 - 8);

    this.frame_sets = {};

    this.layer = layer;
    this.visible = true;

    if (this.constructor == Animal) {
      throw new Error("Animal je apstraktna klasa i ne može se instancirati izravno.");
    }

  }

  jump(h = 50) {

    if (!this.jumping) {

      this.jumping = true;
      this.velocity_y -= h;

    }
  }

}

class Racoon extends Animal {
  constructor(layer) {
    super(0, 0, layer);

    this.frame_sets = {
      "up": [1],
      "walk-up": [1],
      "right": [1],
      "walk-right": [2, 3, 4, 5, 6, 7, 8],
      "down": [1],
      "walk-down": [1],
      "left": [11],
      "walk-left": [12, 13, 14, 15, 16, 17, 18]
    };

    this.okvir = true;
    this.puca = false;

    //! postaviti smjer glavnog lika
    this.direction = 90;
  }

  moveRight() {
    this.direction = 90;
    this.velocity_x += 1.5;
  }

  moveLeft() {
    this.direction = 270;
    this.velocity_x -= 1.5;
  }

  pucaj() {

    //! stvaramo novi objekt projektil
    let p = new Projektil(GAME.getSpriteLayer("projektil"));
    GAME.addSprite(p);

    //! dodajemo ga u poseban popis za lakše praćenje
    p.rbr = Postavke.projektili.length;
    Postavke.projektili.push(p);

    // postavi na poziciju i smjer trenutnog lika
    p.x = this.x;
    p.y = this.y;
    p.direction = this.direction;

    p.put = 0;
    p.visible = true;
    p.move = true;

  }

}

class Collectable extends Item {

  constructor(layer) {
    super(layer);

  }

  getType() {
    return this.constructor.name;
  }

}

class Ljestve extends Collectable {
  constructor(layer) {
    super(layer);
    this.visible = true;
  }

  updatePosition() {
    
  }
}
class Projektil extends Item {
  #put;  
  constructor(layer) {
    super(layer);
    this.visible = false;
    this.put = 0;
    this.move = true;
    this.touched = false;
    this.damage = 100;

    this._collidedPlatform = "";
  }

  // potrebno je definirati svojstvo kako bi se točno znalo u kojem trenutku dira neku platformu
  get collidedPlatform() {
    return this._collidedPlatform;
  }
  set collidedPlatform(v) {
    // ako dira platformu, onda string nije prazan već se radi o strani s koje je dira
    if (v != "") {
      // zaustavi projektil
      this.stop();
      //console.log("Projektil se sudario s platformom: " + v);
    }

    this._collidedPlatform = v;
  }

  get put() {
    return this.#put;
  }
  set put(v) {
    if (v >= 200) {
      this.#put = 0;
      this.stop(); // vraća sve postavke za projektil
    }
    else {
      this.#put = v;
    }
  }

  updatePosition() {
    if (this.move) {

      // ovo mora biti prije promjene x-a kako bi se ponašalo "normalno"
      // kod dodira s platformom (update old_x and old_y)
      //super.updatePosition();

      // kretanje projektila po posebnim pravilima
      if (this.direction == 90) {
        this.x += 5; // ide desno
        this.put += 5; // povećava put
      }
      else {
        this.x -= 5; // ide lijevo
        this.put += 5; // povećava put
      }

    }
  }

  stop() {
    this.visible = false;
    this.move = false;

    // popis svih likova u mapi
    let sprites = GAME.activeWorldMap.sprites;

    // izbaci onog koji staje (tako da se više ne crta)
    for (let i = sprites.length - 1; i >= 0; i--) {
      if (sprites[i] === this) {
        sprites.splice(i, 1); // brisanje i-tog elementa        

        Postavke.ukloniProjektil(this);

        break;
      }
    }

  }
}


class Glavni extends Animal {
  constructor(layer) {
    super(0, 1024, layer);

    this.frame_sets = {
      "up": [1],
      "walk-up": [1],
      "right": [1],
      "walk-right": [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      "down": [1],
      "walk-down": [1],
      "left": [14],
      "walk-left": [15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25]
    };

    this.okvir = false;
    this.puca = false;
    this.visible = true;

    //! postaviti smjer glavnog lika
    this.direction = 90;

    this.bodovi = 0;
    this.health = 100; 
  }

  

  moveRight() {
    this.direction = 90;
    this.velocity_x += 1.5;
  }

  moveLeft() {
    this.direction = 270;
    this.velocity_x -= 1.5;
  }

  pucaj() {

    //! stvaramo novi objekt projektil
    let p = new Projektil(GAME.getSpriteLayer("Projektil"));
    GAME.addSprite(p);

    //! dodajemo ga u poseban popis za lakše praćenje
    p.rbr = Postavke.projektili.length;
    Postavke.projektili.push(p);

    // postavi na poziciju i smjer trenutnog lika
    p.x = this.x;
    p.y = this.y;
    p.direction = this.direction;

    p.put = 0;
    p.visible = true;
    p.move = true;

  }
}

class Ljestve_pomoc extends Item {
  constructor(layer) {
    super(layer);
    this.visible = false;
  }

  updatePosition() {

  }
}

class Coin extends Collectable {
  constructor(layer) {
    super(layer);
    this.y -= layer.height;
    this.visible = true;
    this.value = 10;
  }

  updatePosition() {
    
  }
}

class Blago extends Collectable {
  constructor(layer) {
    super(layer);
    this.y -= layer.height;
    this.visible = true;
    this.value = 50;
  }
  updatePosition() {
  
  }
}

class Vatra extends Collectable {
  constructor(layer) {
    super(layer);
    this.y -= layer.height;
    this.visible = true;
    this.damage = 50;
    this.touched = false; 
  }

  updatePosition() {
    
  }
}

class Kraj extends Collectable {
  constructor(layer) {
    super(layer);
    this.visible = true;
    this.y -= layer.height;
  }

  updatePosition() {
    
  }
}

class Golem extends Animal {
  constructor(layer) {
    super(0, 0, layer);
    this.visible = true;
    this.health = 100;
    this.damage = 34;
    this.direction = 270;
    this.value = Postavke.random(2,5)*10; // vrijednost koju će igrač dobiti ako ga pogodi

    this.frame_sets = {
      "up": [2],
      "walk-up": [2],
      "right": [2],
      "walk-right": [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      "down": [2],
      "walk-down": [2],
      "left": [14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25],
      "walk-left": [14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25]
    };

    this.okvir = false;
    this.puca = false;
    this.velocity_x = 0;
    this.velocity_y = 0;

  }

  pucaj() {

    //! stvaramo novi objekt projektil
    let p = new Projektil(GAME.getSpriteLayer("Projektil"));
    GAME.addSprite(p);

    //! dodajemo ga u poseban popis za lakše praćenje
    p.rbr = Postavke.losi_projektili.length;
    Postavke.losi_projektili.push(p);

    // postavi na poziciju i smjer trenutnog lika
    p.x = this.x;
    p.y = this.y;
    p.direction = this.direction;

    p.put = 0;
    p.visible = true;
    p.move = true;

  }
}