class Animal {

  constructor() {
    if (this.constructor == Animal) {
      throw new Error("Apstraktna klasa se ne može instancirati");
    }
  }

  say() {
    throw new Error("Metoda say() se mora implementirati");
  }

  eat() {
    console.log("jedem...");
  }
}

class Dog extends Animal {
  say() {
    console.log("vau vau");
  }
}

class Cat extends Animal {
  say() {
    console.log("mijau");
  }
}

class Mouse extends Animal { }

