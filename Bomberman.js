// Configuración inicial
let tablero;
let jugador;
let bombas = []; // Lista de bombas
let msg = "Presiona Play para iniciar";
let enemigos = []; // Lista de enemigos
let ultimaColision = 0; // Tiempo del último daño causado al jugador
let enemigo;
let music;
let music_bomb;
let is_power;
let power_type;
let size_bomb;
let iniciado = false; // Variable para controlar si el juego está iniciado

//timer
let timer = 120; // Tiempo inicial en segundos
let interval; // Variable para el intervalo

function preload() {
  // Carga el archivo de audio
  music = loadSound("ambient_music.mp3");
  music_bomb = loadSound("music_bomb.mp3");
  fuego_img = loadImage("fuego.jpeg");
}

function setup() {
  createCanvas(680, 680); // Cada celda será de 40x40 px

  interval = setInterval(updateTimer, 1000); // Actualiza el temporizador cada segundo

  // Crear el botón de "Play"
  botonPlay = createButton("PLAY");
  botonPlay.style("font-size", "32px"); // Tamaño de la fuente más grande
  botonPlay.style("padding", "10px 20px"); // Añadir espacio interno al botón
  botonPlay.position(width / 2 - 75, height / 2 - 30); // Centrar el botón
  botonPlay.mousePressed(iniciarJuego); // Llamar a iniciarJuego cuando se presiona
  /////////////////

  tablero = new Tablero(17, 17);
  jugador = new Jugador();
  jugador.aparecer(1, 1);

  for (let i = 0; i < 3; i++) {
    let enemigo = new Balloon();
    enemigo.aparecerAleatorio(tablero.grid);
    enemigos.push(enemigo);
  }

  // Reproduce la música en bucle
  if (music) {
    music.loop();
  }

  enemigo = new Balloon();
  enemigo.aparecerAleatorio(tablero.grid);
  is_power = new Power();
  power_type = int(random(1, 4));
  is_power.aparecerAleatorio(tablero.grid);
}

function draw() {
  background(220);

  if (iniciado) {
    tablero.display();
    if (jugador.vida > 0) {
      //dejar de pintar jugador
      jugador.dibujar(tablero.cellSize);
    } else {
      muerteJugador();
    }

    bombas.forEach((bomba) => bomba.dibujar(tablero.cellSize));
    enemigos.forEach((enemigo) => {
      enemigo.dibujar(tablero.cellSize);
      enemigo.moverBalloon(tablero.grid);
    });
    detectarColisiones();

    console.log(power_type);
    if (power_type == 3) {
      is_power.dibujar_power_3(tablero.cellSize);
    }
    if (power_type == 2) {
      is_power.dibujar_power_2(tablero.cellSize);
    }

    if (power_type == 1) {
      is_power.dibujar_power_1(tablero.cellSize);
    }

    dibujarVidas();
    text(`Tiempo: ${timer}`, width / 2, 25); // Dibuja el texto en la parte superior
  } else {
    // Mensaje de espera
    fill(0);
    textSize(20);
    textAlign(CENTER, CENTER);
    text(msg, width / 2, height / 2 + 50);
  }
}

// Función para actualizar el temporizador
function updateTimer() {
  if (timer > 0) {
    timer--; // Reduce el tiempo en 1
  } else {
    clearInterval(interval); // Detiene el temporizador cuando llega a 0
    jugador.vida = 0;
  }
}

function iniciarJuego() {
  iniciado = true; // Cambiar el estado a iniciado
  botonPlay.hide(); // Ocultar el botón después de presionarlo
}

function muerteJugador() {
  if (timer == 0) {
    msg = "tiempo agotado, presiona f5 para reiniciar!";
  } else {
    msg = "juego terminado, presiona f5";
  }

  iniciado = false;
  //botonPlay.show(); // mostrar el botón
}

function keyPressed() {
  if (keyCode === 32) {
    // Espacio
    if (bombas.length < jugador.cant_nuke) {
      jugador.ponerBomba();
    }
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
    bezierVertex(
      20 + i * (heartSize + 10) - 5,
      15,
      20 + i * (heartSize + 10) - 10,
      25,
      20 + i * (heartSize + 10),
      30
    );
    bezierVertex(
      20 + i * (heartSize + 10) + 10,
      25,
      20 + i * (heartSize + 10) + 5,
      15,
      20 + i * (heartSize + 10),
      20
    );
    endShape(CLOSE);
  }
}

function contador() {}

function detectarColisiones() {
  let tiempoActual = millis(); // Tiempo actual en milisegundos
  if (tiempoActual - ultimaColision >= 1000) {
    // Verificar si ha pasado un segundo
    enemigos.forEach((enemigo) => {
      if (enemigo.x === jugador.x && enemigo.y === jugador.y) {
        jugador.vida--;
        ultimaColision = tiempoActual; // Actualizar el tiempo de la última colisión
        console.log(
          `Jugador dañado por enemigo! Vida restante: ${jugador.vida}`
        );
      }
    });
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
        if (
          i === 0 ||
          j === 0 ||
          i === this.rows - 1 ||
          j === this.cols - 1 ||
          (i % 2 === 0 && j % 2 === 0)
        ) {
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
    const hayBomba = (x, y) =>
      bombas.some((bomba) => bomba.x === x && bomba.y === y);
    let newX = this.x + dx;
    let newY = this.y + dy;
    // Verificar límites y colisiones
    if (newX >= 0 && newX < grid[0].length && newY >= 0 && newY < grid.length) {
      if (grid[newY][newX] === 1 && !hayBomba(newX, newY)) {
        // Solo se puede mover a celdas de pasto
        this.x = newX;
        this.y = newY;
      }
    }
  }

  dibujar(celdaTamaño) {
    let px = this.x * celdaTamaño;
    let py = this.y * celdaTamaño;
    fill(255, 0, 0); // Color rojo para entidades
    ellipse(
      this.x * celdaTamaño + celdaTamaño / 2,
      this.y * celdaTamaño + celdaTamaño / 2,
      celdaTamaño * 0.8
    );
  }
}

// Clase Jugador
class Jugador extends Entidad {
  constructor() {
    super();
    this.cant_nuke = 1;
    this.vida = 3; // Vida específica del jugador
    this.size_nuke = 1;
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
    rect(x + 12, y + 6, 16, 16);

    // Casco
    fill(255, 0, 0); // Rojo
    rect(x + 10, y + 4, 20, 12);
    rect(x + 12, y + 2, 16, 4);

    // Ojos
    fill(0); // Negro
    rect(x + 16, y + 10, 4, 4);
    rect(x + 24, y + 10, 4, 4);

    // Cuerpo
    fill(0, 0, 255); // Azul
    rect(x + 14, y + 22, 12, 16);

    // Brazos
    fill(255, 0, 0); // Rojo
    rect(x + 10, y + 22, 4, 12);
    rect(x + 26, y + 22, 4, 12);

    // Piernas
    fill(0);
    rect(x + 12, y + 35, 4, 8);
    rect(x + 20, y + 35, 4, 8);
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
    let scale = 1 + 0.1 * sin((frameCount * TWO_PI) / 60); // Palpitación dinámica basada en frames
    fill(0); // Negro para la bomba
    ellipse(
      px + celdaTamaño / 2,
      py + celdaTamaño / 2,
      celdaTamaño * 0.6 * scale
    );
  }

  explotar(celdaTamaño, grid) {
    music_bomb.play();
    this.explosionFrames = 30; // Duración de la animación de la explosión (30 frames)
    // Dibujar la explosión en los cuadros aledaños

    // for (let i = 1; i <= jugador.size_nuke; i++) {
    //   this.dibujarExplosion(celdaTamaño, this.x, this.y, grid);
    //   this.dibujarExplosion(celdaTamaño, this.x + i / 100, this.y, grid);
    //   this.dibujarExplosion(celdaTamaño, this.x - i / 100, this.y, grid);
    //   this.dibujarExplosion(celdaTamaño, this.x, this.y + i / 100, grid);
    //   this.dibujarExplosion(celdaTamaño, this.x, this.y - i / 100, grid);
    // }
    for (let i = 0.2; i < 600; i += 0.1) {
      this.dibujarExplosion(celdaTamaño, this.x + i, this.y, grid);
      this.dibujarExplosion(celdaTamaño, this.x - i, this.y, grid);
      this.dibujarExplosion(celdaTamaño, this.x, this.y + i, grid);
      this.dibujarExplosion(celdaTamaño, this.x, this.y - i, grid);
    }

    // Eliminar la bomba después de la explosión
    let index = bombas.indexOf(this);
    if (index !== -1) {
      bombas.splice(index, 1);
    }
  }

  dibujarExplosion(celdaTamaño, x, y, grid) {
    // Detectar si hay un enemigo en la posición afectada
    enemigos = enemigos.filter((enemigo) => {
      if (enemigo.x === x && enemigo.y === y) {
        console.log(`Enemigo eliminado en (${x}, ${y})`);
        return false; // Eliminar el enemigo
      }
      return true;
    });

    // Detectar si hay una entidad en la posición afectada
    if (jugador.x === x && jugador.y === y) {
      jugador.vida--; // Reducir vida del jugador
      console.log(`Jugador dañado! Vida restante: ${jugador.vida}`);
    }

    if (grid && grid[y] && grid[y][x] !== undefined) {
      if (grid[y][x] === 2) {
        grid[y][x] = 1; // Cambiar bloques tipo 2 a tipo 1
      }
      if (grid[y][x] !== 0) {
        // Dibujar explosión solo si no es bloque sólido
        let px = x * celdaTamaño;
        let py = y * celdaTamaño;
        //fill(255, 200, 50, 150); // Naranja translúcido
        fill(255, random(50, 150), 0); // Degradado de color
        noStroke();
        ellipse(px + celdaTamaño / 2, py + celdaTamaño / 2, celdaTamaño);
        // image(
        //   fuego_img,
        //   px + celdaTamaño / 2,
        //   py + celdaTamaño / 2,
        //   celdaTamaño
        // );
      }
    }
  }
}

class Power extends Entidad {
  constructor() {
    super();
    this.vida = 1; // Vida específica del jugador
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

  dibujar_power_1(celdaTamaño) {
    let px = this.x * celdaTamaño;
    let py = this.y * celdaTamaño;
    let cx = px + celdaTamaño / 2; // Coordenada x del centro
    let cy = py + celdaTamaño / 2; // Coordenada y del centro
    let radioExterno = celdaTamaño * 0.4; // Radio externo de la estrella
    let radioInterno = celdaTamaño * 0.2; // Radio interno de la estrella
    let numPicos = 5; // Número de picos de la estrella

    fill(255, 223, 0); // Color amarillo para la estrella
    noStroke();

    beginShape();
    for (let i = 0; i < numPicos * 2; i++) {
      let angulo = (PI / numPicos) * i;
      let radio = i % 2 === 0 ? radioExterno : radioInterno;
      let x = cx + cos(angulo) * radio;
      let y = cy + sin(angulo) * radio;
      vertex(x, y);
    }
    endShape(CLOSE);

    if (jugador.x === this.x && jugador.y === this.y) {
      jugador.cant_nuke++; // Reducir vida del jugador
      console.log(`Cantidad Bombas: ${jugador.cant_nuke}`);
      power_type = int(random(1, 4));
      is_power.aparecerAleatorio(tablero.grid);
    }
  }

  dibujar_power_3(celdaTamaño) {
    let px = this.x * celdaTamaño;
    let py = this.y * celdaTamaño;
    let cx = px + celdaTamaño / 2;
    let cy = py + celdaTamaño / 2;

    noStroke();
    for (let i = 0; i < 5; i++) {
      fill(255, random(50, 150), 0, 150 - i * 30); // Degradado de color
      beginShape();
      for (let angulo = 0; angulo < TWO_PI; angulo += PI / 8) {
        let offset = random(-celdaTamaño * 0.05, celdaTamaño * 0.05);
        let radio = celdaTamaño * 0.3 + offset + i * 5;
        let x = cx + cos(angulo) * radio;
        let y = cy - sin(angulo) * radio; // Fuego se extiende hacia arriba
        vertex(x, y);
      }
      endShape(CLOSE);
    }
    if (jugador.x === this.x && jugador.y === this.y) {
      jugador.size_nuke++; // Reducir vida del jugador
      console.log(`Cantidad Bombas: ${jugador.size_nuke}`);
      power_type = int(random(1, 4));
      is_power.aparecerAleatorio(tablero.grid);
    }
  }

  dibujar_power_2(celdaTamaño) {
    let px = this.x * celdaTamaño;
    let py = this.y * celdaTamaño;
    let cx = px + celdaTamaño / 2; // Centro en x
    let cy = py + celdaTamaño / 2; // Centro en y
    let escala = celdaTamaño / 40; // Reducimos más la escala para que encaje en la celda

    fill(255, 0, 127); // Color rosado fuerte
    noStroke();

    beginShape();
    for (let t = 0; t < TWO_PI; t += 0.01) {
      // Fórmula paramétrica del corazón ajustada a la nueva escala
      let x = escala * 16 * pow(sin(t), 3);
      let y =
        -escala * (13 * cos(t) - 5 * cos(2 * t) - 2 * cos(3 * t) - cos(4 * t));
      vertex(cx + x, cy + y);
    }
    endShape(CLOSE);
    if (jugador.x === this.x && jugador.y === this.y) {
      jugador.vida++;
      console.log(`Cantidad Bombas: ${jugador.cant_nuke}`);
      power_type = int(random(1, 4));
      is_power.aparecerAleatorio(tablero.grid);
    }
  }
}

class Balloon extends Entidad {
  constructor() {
    super();
    this.vida = 1; // Vida específica del enemigo
    this.direccion = { dx: 1, dy: 0 }; // Dirección inicial: derecha
    this.velocidad = 0; // Velocidad en frames por movimiento (1 casilla por segundo)
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

  moverBalloon(grid) {
    while (this.velocidad == 20) {
      const nuevaX = this.x + this.direccion.dx;
      const nuevaY = this.y + this.direccion.dy;

      // Comprobar si puede moverse en la dirección actual
      if (
        grid[nuevaY] &&
        grid[nuevaY][nuevaX] === 1 &&
        !bombas.some((bomba) => bomba.x === nuevaX && bomba.y === nuevaY)
      ) {
        this.x = nuevaX;
        this.y = nuevaY;
      } else {
        // Cambiar dirección si encuentra un obstáculo
        this.direccion.dx *= -1;
        this.direccion.dy *= -1;
      }

      // Cambiar dirección aleatoriamente cada 5 movimientos
      this.movimientos++;
      if (this.movimientos % 5 === 0) {
        const direcciones = [
          { dx: 1, dy: 0 }, // Derecha
          { dx: -1, dy: 0 }, // Izquierda
          { dx: 0, dy: 1 }, // Abajo
          { dx: 0, dy: -1 }, // Arriba
        ];
        this.direccion = random(direcciones);
      }
      this.velocidad = 0;
    }
    this.velocidad++;
  }

  dibujar(celdaTamaño) {
    let px = this.x * celdaTamaño;
    let py = this.y * celdaTamaño;
    fill(255, 182, 193); // Color rosado para el globo
    noStroke();
    ellipse(px + celdaTamaño / 2, py + celdaTamaño / 2, celdaTamaño * 0.8);
    fill(0); // Negro para los ojos
    ellipse(
      px + celdaTamaño / 2 - celdaTamaño * 0.15,
      py + celdaTamaño / 2 - celdaTamaño * 0.1,
      celdaTamaño * 0.1
    );
    ellipse(
      px + celdaTamaño / 2 + celdaTamaño * 0.15,
      py + celdaTamaño / 2 - celdaTamaño * 0.1,
      celdaTamaño * 0.1
    );
    noFill();
    stroke(0);
    strokeWeight(1);
    arc(
      px + celdaTamaño / 2,
      py + celdaTamaño / 2 + celdaTamaño * 0.05,
      celdaTamaño * 0.4,
      celdaTamaño * 0.2,
      0,
      PI
    );
  }
}
