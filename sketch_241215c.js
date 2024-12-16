// Configuración inicial
let tablero;
let jugador;
let bombas = []; // Lista de bombas
let enemigo;

function setup() {
  createCanvas(680, 680); // Cada celda será de 40x40 px
  tablero = new Tablero(17, 17);
  jugador = new Jugador();
  jugador.aparecer(1, 1);
  
  enemigo = new Balloon();
  enemigo.aparecerAleatorio(tablero.grid);
}

function draw() {
  background(220);
  tablero.display();
  jugador.dibujar(tablero.cellSize);
  bombas.forEach((bomba) => bomba.dibujar(tablero.cellSize));
  enemigo.dibujar(tablero.cellSize);
  dibujarVidas();
}

function keyPressed() {
  if (keyCode === 32) { // Espacio
    jugador.ponerBomba();
  }
  if (keyCode === UP_ARROW) {
    jugador.mover(0, -1, tablero.grid);
  } else if (keyCode === DOWN_ARROW) {
    jugador.mover(0, 1, tablero.grid);
  } else if (keyCode === LEFT_ARROW) {
    jugador.mover(-1, 0, tablero.grid);
  } else if (keyCode === RIGHT_ARROW) {
    jugador.mover(1, 0, tablero.grid);
  }
}

function dibujarVidas() {
  let heartSize = 20;
  for (let i = 0; i < jugador.vida; i++) {
    fill(255, 0, 0); // Rojo para corazones
    noStroke();
    beginShape();
    vertex(20 + i * (heartSize + 10), 20);
    bezierVertex(20 + i * (heartSize + 10) - 5, 15, 20 + i * (heartSize + 10) - 10, 25, 20 + i * (heartSize + 10), 30);
    bezierVertex(20 + i * (heartSize + 10) + 10, 25, 20 + i * (heartSize + 10) + 5, 15, 20 + i * (heartSize + 10), 20);
    endShape(CLOSE);
  }
}

// Clase Tablero
class Tablero {
  constructor(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    this.cellSize = 40; // Tamaño de cada celda en píxeles
    this.grid = this.generateGrid();
  }

  generateGrid() {
    let grid = [];
    for (let i = 0; i < this.rows; i++) {
      let row = [];
      for (let j = 0; j < this.cols; j++) {
        if (i === 0 || j === 0 || i === this.rows - 1 || j === this.cols - 1 || (i % 2 === 0 && j % 2 === 0)) {
          row.push(0); // Bloques sólidos (vigas de acero)
        } else {
          row.push(1); // Bloques verdes (pasto) por defecto
        }
      }
      grid.push(row);
    }

    // Colocar bloques rompibles de forma aleatoria en las celdas vacías (tipo 1)
    for (let i = 1; i < this.rows - 1; i++) {
      for (let j = 1; j < this.cols - 1; j++) {
        if (grid[i][j] === 1 && random() < 0.3) {
          grid[i][j] = 2; // Bloques rompibles (paredes de ladrillos)
        }
      }
    }
    
    // Asegurar bloques tipo 1 en las esquinas específicas
    grid[1][1] = 1;
    grid[2][1] = 1;
    grid[1][2] = 1;

    grid[this.rows - 2][this.cols - 2] = 1;
    grid[this.rows - 3][this.cols - 2] = 1;
    grid[this.rows - 2][this.cols - 3] = 1;

    return grid;
  }

  display() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        stroke(0);
        switch (this.grid[i][j]) {
          case 0:
            this.drawSolidBlock(j * this.cellSize, i * this.cellSize);
            break;
          case 1:
            this.drawGrassBlock(j * this.cellSize, i * this.cellSize);
            break;
          case 2:
            this.drawBrickBlock(j * this.cellSize, i * this.cellSize);
            break;
        }
      }
    }
  }

  drawSolidBlock(x, y) {
    fill(100); // Gris oscuro
    rect(x, y, this.cellSize, this.cellSize);
    strokeWeight(2);
    line(x, y, x + this.cellSize, y); // Borde superior
    line(x, y, x, y + this.cellSize); // Borde izquierdo
    line(x + this.cellSize, y, x + this.cellSize, y + this.cellSize); // Borde derecho
    line(x, y + this.cellSize, x + this.cellSize, y + this.cellSize); // Borde inferior
    strokeWeight(1);
  }

  drawGrassBlock(x, y) {
    fill(34, 139, 34); // Verde oscuro
    rect(x, y, this.cellSize, this.cellSize);
    stroke(0, 100, 0);
    for (let i = 0; i < this.cellSize; i += 8) {
      line(x + i, y, x + i + 4, y + this.cellSize); // Zig-zag verde claro
      line(x + i + 4, y, x + i, y + this.cellSize); // Zig-zag verde oscuro
    }
  }

  drawBrickBlock(x, y) {
    fill(169, 169, 169); // Gris claro
    rect(x, y, this.cellSize, this.cellSize);
    stroke(105, 105, 105);
    for (let i = 0; i < this.cellSize; i += 10) {
      line(x, y + i, x + this.cellSize, y + i); // Líneas horizontales discontinuas
    }
    for (let i = 0; i < this.cellSize; i += 10) {
      if ((y / 10) % 2 === 0) {
        line(x + i, y, x + i, y + this.cellSize); // Líneas verticales discontinuas
      } else {
        line(x + i + 5, y, x + i + 5, y + this.cellSize);
      }
    }
  }
}

// Clase Entidad
class Entidad {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.vida = 1; // Vida inicial de la entidad
  }

  aparecer(posX, posY) {
    this.x = posX;
    this.y = posY;
  }

  mover(dx, dy, grid) {
    const hayBomba = (x, y) => bombas.some(bomba => bomba.x === x && bomba.y === y);
    let newX = this.x + dx;
    let newY = this.y + dy;
    // Verificar límites y colisiones
    if (newX >= 0 && newX < grid[0].length && newY >= 0 && newY < grid.length) {
      if (grid[newY][newX] === 1 && !hayBomba(newX, newY)) { // Solo se puede mover a celdas de pasto
        this.x = newX;
        this.y = newY;
      }
    }
  }

  dibujar(celdaTamaño) {
    let px = this.x * celdaTamaño;
    let py = this.y * celdaTamaño;
    fill(255, 0, 0); // Color rojo para entidades
    ellipse(this.x * celdaTamaño + celdaTamaño / 2, this.y * celdaTamaño + celdaTamaño / 2, celdaTamaño * 0.8);
  }
}

// Clase Jugador
class Jugador extends Entidad {
  constructor() {
    super();
    this.vida = 3; // Vida específica del jugador
  }

  ponerBomba() {
    let nuevaBomba = new Bomba(this.x, this.y);
    bombas.push(nuevaBomba);
  }

  dibujar(celdaTamaño) {
    // Dibujo de un personaje estilo pixel art
    let x = this.x * celdaTamaño;
    let y = this.y * celdaTamaño;
    noStroke();

    // Cabeza
    fill(255, 224, 189); // Color piel
    rect(x + 12, y + 8, 16, 16);

    // Casco
    fill(255, 0, 0); // Rojo
    rect(x + 10, y + 6, 20, 12);
    rect(x + 12, y + 4, 16, 4);

    // Ojos
    fill(0); // Negro
    rect(x + 16, y + 12, 4, 4);
    rect(x + 24, y + 12, 4, 4);

    // Cuerpo
    fill(0, 0, 255); // Azul
    rect(x + 14, y + 24, 12, 16);

    // Brazos
    fill(255, 0, 0); // Rojo
    rect(x + 10, y + 24, 4, 12);
    rect(x + 26, y + 24, 4, 12);

    // Piernas
    fill(0);
    rect(x + 16, y + 40, 4, 8);
    rect(x + 20, y + 40, 4, 8);
  }
}

class Bomba {
  constructor(x, y) {
    this.x = x; // Posición en el tablero
    this.y = y;
    this.tamaño = 0.6; // Escala inicial
    this.creciendo = true; // Indicador de cambio de tamaño
    this.timer = 180; // Temporizador en frames (3 segundos a 60 FPS)
    this.explosionFrames = -1; // Controla los frames de la explosión
  }

  dibujar(celdaTamaño) {
    this.timer--;
    if (this.timer <= 0) {
      this.explotar(celdaTamaño, tablero.grid);
      return;
    }

    let px = this.x * celdaTamaño;
    let py = this.y * celdaTamaño;
    let scale = 1 + 0.1 * sin((frameCount) * TWO_PI / 60); // Palpitación dinámica basada en frames
    fill(0); // Negro para la bomba
    ellipse(px + celdaTamaño / 2, py + celdaTamaño / 2, celdaTamaño * 0.6 * scale);
  }

  explotar(celdaTamaño, grid) {
    this.explosionFrames = 30; // Duración de la animación de la explosión (30 frames)

    // Dibujar la explosión en los cuadros aledaños
    this.dibujarExplosion(celdaTamaño, this.x, this.y, grid);
    this.dibujarExplosion(celdaTamaño, this.x + 1, this.y, grid);
    this.dibujarExplosion(celdaTamaño, this.x - 1, this.y, grid);
    this.dibujarExplosion(celdaTamaño, this.x, this.y + 1, grid);
    this.dibujarExplosion(celdaTamaño, this.x, this.y - 1, grid);

    // Eliminar la bomba después de la explosión
    let index = bombas.indexOf(this);
    if (index !== -1) {
      bombas.splice(index, 1);
    }
  }

dibujarExplosion(celdaTamaño, x, y, grid) {
    // Detectar si hay una entidad en la posición afectada
    if (jugador.x === x && jugador.y === y) {
      jugador.vida--; // Reducir vida del jugador
      console.log(`Jugador dañado! Vida restante: ${jugador.vida}`);
    }
    if (grid && grid[y] && grid[y][x] !== undefined) {
      if (grid[y][x] === 2) {
        grid[y][x] = 1; // Cambiar bloques tipo 2 a tipo 1
      }
      if (grid[y][x] !== 0) { // Dibujar explosión solo si no es bloque sólido
        let px = x * celdaTamaño;
        let py = y * celdaTamaño;
        fill(255, 165, 0, 150); // Naranja translúcido
        noStroke();
        ellipse(px + celdaTamaño / 2, py + celdaTamaño / 2, celdaTamaño);
      }
    }
  }
}

class Balloon extends Entidad {
  constructor() {
    super();
    this.vida = 1; // Vida específica del enemigo
  }

  aparecerAleatorio(grid) {
    let posicionesValidas = [];

    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        if (
          grid[y][x] === 1 && // Solo en bloques de pasto
          !(x === 1 && y === 1) && // Excluir esquina superior izquierda
          !(x === grid[0].length - 2 && y === grid.length - 2) // Excluir esquina inferior derecha
        ) {
          posicionesValidas.push({ x, y });
        }
      }
    }

    if (posicionesValidas.length > 0) {
      let pos = random(posicionesValidas);
      this.x = pos.x;
      this.y = pos.y;
    }
  }

  dibujar(celdaTamaño) {
    let px = this.x * celdaTamaño;
    let py = this.y * celdaTamaño;
    fill(255, 182, 193); // Color rosado para el globo
    noStroke();
    ellipse(px + celdaTamaño / 2, py + celdaTamaño / 2, celdaTamaño * 0.8);
    fill(0); // Negro para los ojos
    ellipse(px + celdaTamaño / 2 - celdaTamaño * 0.15, py + celdaTamaño / 2 - celdaTamaño * 0.1, celdaTamaño * 0.1);
    ellipse(px + celdaTamaño / 2 + celdaTamaño * 0.15, py + celdaTamaño / 2 - celdaTamaño * 0.1, celdaTamaño * 0.1);
    noFill();
    stroke(0);
    strokeWeight(1);
    arc(px + celdaTamaño / 2, py + celdaTamaño / 2 + celdaTamaño * 0.05, celdaTamaño * 0.4, celdaTamaño * 0.2, 0, PI);
  }
}
