// Configuración inicial
let tablero;
let jugador;
let bombas = []; // Lista de bombas
let msg = "Presiona Play para iniciar";
let enemigos = []; // Lista de enemigos
let ultimaColision = 0; // Tiempo del último daño causado al jugador
let nivelactual = 1;
let mensajeDeNivel = false; // Visualización del mensaje
let termino = true;
let tiempoMensaje = 0; 
let enemigo;
let music;
let music_bomb;
let is_power;
let power_type;
let size_bomb;
let iniciado = false; // Variable para controlar si el juego está iniciado
let bloqueirrompible, bloqueirrompible2, bloqueirrompible3;
let bloquedebil, bloquedebil2, bloquedebil3;
let pasto, pasto2, pasto3;
let prota;

//control de niveles prototipo
const niveles = {
  1: 1,
  2: 2,
  3: 3,
  4: 4
};

//timer
let timer = 120; // Tiempo inicial en segundos
let interval; // Variable para el intervalo

function preload() {
  // Carga el archivo de audio
  music = loadSound("ambient_music.mp3");
  music_bomb = loadSound("music_bomb.mp3");
  pasto = loadImage("Pasto.JPG");
  pasto2 = loadImage("Pasto2.JPG");
  pasto3 = loadImage("Pasto3.JPG");
  bloqueirrompible = loadImage("Ladrillo.JPG");
  bloqueirrompible2 = loadImage("Ladrillo2.JPG");
  bloqueirrompible3 = loadImage("Ladrillo3.JPG");
  bloquedebil = loadImage("LadrilloDebil.JPG");
  bloquedebil2 = loadImage("LadrilloDebil2.JPG");
  bloquedebil3 = loadImage("LadrilloDebil3.JPG");
  prota = loadImage("Prota.PNG");
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

  // Reproduce la música en bucle
  if (music) {
    music.loop();
  }

  generarEnemigos();
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

  if (mensajeDeNivel) {
    fill(0, 0, 0, 150);
    rect(0, height / 3, width, 100);
    fill(255);
    textSize(40);
    textAlign(CENTER, CENTER);
    text(msg, width / 2, height / 3 + 50); // El mensaje que aparece en pantalla
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

function generarEnemigos() {
  const cantidadEnemigos = niveles[nivelactual];
  
  for (let i = 0; i < cantidadEnemigos; i++) {
      const enemigo = new Balloon(); // Asumiendo que tienes una clase Enemigo
      enemigo.aparecerAleatorio(tablero.grid);
      enemigos.push(enemigo);
  }
}

function pasarDeNivel() {
  nivelactual++;
  if (nivelactual > 4) {
      nivelactual = 1; // Resetear si llegamos al nivel 5
  }

  mensajeDeNivel = true;
  msg = "¡Excelente! Pasaste de nivel";
  tiempoMensaje = millis(); // Marcar el tiempo en el que apareció el mensaje
  setTimeout(() => {
    mensajeDeNivel = false; // Ocultar el mensaje después de un tiempo
  }, 500);
  cargarNuevoMapa();
}

function cargarNuevoMapa() {
  console.log('Cargando nuevo mapa...');
  tablero = new Tablero(17, 17);
  jugador.aparecer(1, 1);
  bombas = []
  generarEnemigos();
  power_type = int(random(1, 4));
  is_power.aparecerAleatorio(tablero.grid);
  timer = 120; // Resetear temporizador
  iniciarJuego()
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
    if(nivelactual == 1){
      image(bloqueirrompible, x, y, this.cellSize, this.cellSize);
    }
    else if(nivelactual == 2){
      image(bloqueirrompible2, x, y, this.cellSize, this.cellSize);
    }
    else{
      image(bloqueirrompible3, x, y, this.cellSize, this.cellSize);
    }
  }

  drawGrassBlock(x, y) {
    if(nivelactual == 1){
      image(pasto, x, y, this.cellSize, this.cellSize);
    }
    else if(nivelactual == 2){
      image(pasto2, x, y, this.cellSize, this.cellSize);
    }
    else{
      image(pasto3, x, y, this.cellSize, this.cellSize);
    }
    }

  drawBrickBlock(x, y) {
    if(nivelactual == 1){
      image(bloquedebil, x, y, this.cellSize, this.cellSize);
    }
    else if(nivelactual == 2){
      image(bloquedebil2, x, y, this.cellSize, this.cellSize);
    }
    else{
      image(bloquedebil3, x, y, this.cellSize, this.cellSize);
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

    image(prota, x, y, 40, 40);
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
    this.explosionFrames = 25; // Duración de la animación de la explosión (30 frames)
    // Dibujar la explosión en los cuadros aledaños

    for (let i = 1; i <= jugador.size_nuke; i++) {
      this.dibujarExplosion(celdaTamaño, this.x, this.y, grid);
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

    if (enemigos.length === 0) {
      pasarDeNivel();
    }

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
        fill(255, 165, 0, 150); // Naranja translúcido
        noStroke();
        ellipse(px + celdaTamaño / 2, py + celdaTamaño / 2, celdaTamaño);
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
    if (this.velocidad > 0) {
      this.velocidad--; // Disminuimos el contador de velocidad
      return; 
    }
  
    // Contador para los pasos del enemigo
    if (!this.contadorPasos) {
      this.contadorPasos = 0;
    }
  
    // Incrementamos el contador de pasos
    this.contadorPasos++;
  
    const direcciones = [
      { dx: 1, dy: 0 },  // Derecha
      { dx: -1, dy: 0 }, // Izquierda
      { dx: 0, dy: 1 },  // Abajo
      { dx: 0, dy: -1 }, // Arriba
    ];
  
    // Si ya se ha alcanzado el número de pasos, cambiamos la dirección
    if (this.contadorPasos >= 8) {
      this.contadorPasos = 0; // Reiniciamos el contador de pasos
  
      // Intentamos mover en cualquier dirección válida, pero no hacia atrás
      let direccionesPosibles = direcciones.filter(dir => {
        const nuevaX = this.x + dir.dx;
        const nuevaY = this.y + dir.dy;
  
        // Comprobamos si la nueva posición es válida 
        return (
          grid[nuevaY] && 
          grid[nuevaY][nuevaX] === 1 && 
          !bombas.some(bomba => bomba.x === nuevaX && bomba.y === nuevaY) &&
          // Evitar retroceder (evitamos la dirección opuesta a la anterior)
          !(this.direccionAnterior && dir.dx === -this.direccionAnterior.dx && dir.dy === -this.direccionAnterior.dy)
        );
      });
  
      // Si encontramos direcciones posibles, elegimos una aleatoria
      if (direccionesPosibles.length > 0) {
        const direccionAleatoria = random(direccionesPosibles);
        this.x += direccionAleatoria.dx;
        this.y += direccionAleatoria.dy;
  
        // Actualizamos la dirección anterior
        this.direccionAnterior = { dx: direccionAleatoria.dx, dy: direccionAleatoria.dy };
      }
    } else {
      // Si no se ha alcanzado el conteo, buscamos un camino alternativo si está bloqueado
      let direccionesPosibles = direcciones.filter(dir => {
        const nuevaX = this.x + dir.dx;
        const nuevaY = this.y + dir.dy;
  
        // Comprobamos si la nueva posición es válida 
        return (
          grid[nuevaY] && 
          grid[nuevaY][nuevaX] === 1 && 
          !bombas.some(bomba => bomba.x === nuevaX && bomba.y === nuevaY) &&
          // Evitar retroceder
          !(this.direccionAnterior && dir.dx === -this.direccionAnterior.dx && dir.dy === -this.direccionAnterior.dy)
        );
      });
  
      // Si no hay direcciones válidas, intentamos mover de forma alternativa (vertical u horizontal)
      if (direccionesPosibles.length === 0) {
        // Si está bloqueado horizontalmente, intentamos mover verticalmente
        const puedeMoverVertical = [
          { dx: 0, dy: 1 },  // Abajo
          { dx: 0, dy: -1 }, // Arriba
        ];
        let movVertical = puedeMoverVertical.filter(dir => {
          const nuevaX = this.x + dir.dx;
          const nuevaY = this.y + dir.dy;
          
          return (
            grid[nuevaY] && 
            grid[nuevaY][nuevaX] === 1 && 
            !bombas.some(bomba => bomba.x === nuevaX && bomba.y === nuevaY)
          );
        });
        
        if (movVertical.length > 0) {
          // Elegimos aleatoriamente un movimiento vertical
          const direccionAleatoria = random(movVertical);
          this.x += direccionAleatoria.dx;
          this.y += direccionAleatoria.dy;
  
          // Actualizamos la dirección anterior
          this.direccionAnterior = { dx: direccionAleatoria.dx, dy: direccionAleatoria.dy };
        } else {
          // Si tampoco hay movimiento vertical posible, buscamos movimiento horizontal
          const puedeMoverHorizontal = [
            { dx: 1, dy: 0 },  // Derecha
            { dx: -1, dy: 0 }, // Izquierda
          ];
          let movHorizontal = puedeMoverHorizontal.filter(dir => {
            const nuevaX = this.x + dir.dx;
            const nuevaY = this.y + dir.dy;
            
            return (
              grid[nuevaY] && 
              grid[nuevaY][nuevaX] === 1 && 
              !bombas.some(bomba => bomba.x === nuevaX && bomba.y === nuevaY)
            );
          });
  
          if (movHorizontal.length > 0) {
            // Elegimos aleatoriamente un movimiento horizontal
            const direccionAleatoria = random(movHorizontal);
            this.x += direccionAleatoria.dx;
            this.y += direccionAleatoria.dy;
  
            // Actualizamos la dirección anterior
            this.direccionAnterior = { dx: direccionAleatoria.dx, dy: direccionAleatoria.dy };
          }
        }
      } else {
        // Si hay direcciones válidas, nos movemos hacia una aleatoria
        const direccionAleatoria = random(direccionesPosibles);
        this.x += direccionAleatoria.dx;
        this.y += direccionAleatoria.dy;
  
        // Actualizamos la dirección anterior
        this.direccionAnterior = { dx: direccionAleatoria.dx, dy: direccionAleatoria.dy };
      }
    }
  
    // Establecemos la velocidad para el siguiente movimiento
    this.velocidad = 25;
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
      celdaTamaño * 0.4, celdaTamaño * 0.2, 0, PI);
  }
}