// NOCHE DE GATOS · Arte generativo con Canvas
// Autor: Rafael Tenesaca

// ---------- VARIABLES ----------
var canvas = document.getElementById("lienzo");
var ctx = canvas.getContext("2d");

var ancho = canvas.width;
var alto = canvas.height;

var horizonte = alto - 220;   // donde empieza el suelo
var totalGatos = 7;
var totalEstrellas = 25;
var totalEdificios = 10;
var paletaActual = 0;

// ---------- ARREGLOS ----------
// Cada paleta: 0 cielo arriba, 1 cielo abajo, 2 estrellas y bigotes,
// 3 suelo y edificios, 4 gato A, 5 gato B, 6 ojos y ventanas
var paletas = [
    ["#382452", "#C9A7F5", "#F0EAF7", "#1C1428", "#0A0710", "#4B3B66", "#E5FF6B"],
    ["#1F6F78", "#FFD6A5", "#FFFFFF", "#12414A", "#0A1B22", "#E8833A", "#FFF176"],
    ["#A63D40", "#FFE8D6", "#FFFFFF", "#5C1F2B", "#1A0A10", "#E8E1DA", "#7CF5C6"]
];

// Datos guardados para que al cambiar de paleta no se muevan las figuras
var estrellasX = [];
var estrellasY = [];
var estrellasTam = [];

var edificiosAncho = [];
var edificiosAlto = [];
var edificiosLuz = [];

var gatosX = [];
var gatosY = [];
var gatosTam = [];
var gatosLado = [];       // 1 = cola a la derecha, -1 = cola a la izquierda
var gatosDespierto = [];  // true = ojos abiertos, false = dormido

var lunaX = 0;
var lunaY = 0;

// ---------- FUNCIONES DE DIBUJO ----------

// Fondo del cielo con degradado
function dibujarFondo() {
    var colores = paletas[paletaActual];
    var degradado = ctx.createLinearGradient(0, 0, 0, horizonte);
    degradado.addColorStop(0, colores[0]);
    degradado.addColorStop(1, colores[1]);

    ctx.fillStyle = degradado;
    ctx.fillRect(0, 0, ancho, alto);
}

// Círculo reutilizable
function dibujarCirculo(x, y, radio, color) {
    ctx.beginPath();
    ctx.arc(x, y, radio, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
}

// Triángulo reutilizable a partir de tres puntos
function dibujarTriangulo(x1, y1, x2, y2, x3, y3, color) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
}

// Línea reutilizable
function dibujarLinea(x1, y1, x2, y2, color, grosor) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color;
    ctx.lineWidth = grosor;
    ctx.stroke();
}

// Luna con halo
function dibujarLuna() {
    var colores = paletas[paletaActual];

    ctx.globalAlpha = 0.2;
    dibujarCirculo(lunaX, lunaY, 75, colores[2]);
    ctx.globalAlpha = 0.4;
    dibujarCirculo(lunaX, lunaY, 58, colores[2]);
    ctx.globalAlpha = 1;
    dibujarCirculo(lunaX, lunaY, 42, colores[2]);
}

// Estrellas
function dibujarEstrellas() {
    var colores = paletas[paletaActual];

    for (var i = 0; i < totalEstrellas; i++) {
        dibujarCirculo(estrellasX[i], estrellasY[i], estrellasTam[i], colores[2]);
    }
}

// Edificios del fondo con rectángulos
function dibujarEdificios() {
    var colores = paletas[paletaActual];
    var posX = 0;

    for (var i = 0; i < totalEdificios; i++) {
        ctx.fillStyle = colores[3];
        ctx.fillRect(posX, horizonte - edificiosAlto[i], edificiosAncho[i], edificiosAlto[i]);

        // Ventana encendida o apagada
        if (edificiosLuz[i] === true) {
            ctx.fillStyle = colores[6];
            ctx.fillRect(posX + edificiosAncho[i] / 2 - 4, horizonte - edificiosAlto[i] + 14, 8, 10);
        }

        posX = posX + edificiosAncho[i] + 3;
    }

    // Suelo
    ctx.fillStyle = colores[3];
    ctx.fillRect(0, horizonte, ancho, alto - horizonte);
}

// Un gato sentado. Todo se calcula a partir de su tamaño (tam).
function dibujarGato(x, y, tam, lado, despierto, colorCuerpo) {
    var colores = paletas[paletaActual];

    // Cola: círculos que forman una curva hacia arriba
    for (var t = 0; t < 10; t++) {
        var colaX = x + lado * (tam * 0.8 + t * tam * 0.12);
        var colaY = y + tam * 0.5 - t * t * tam * 0.02;
        dibujarCirculo(colaX, colaY, tam * 0.14, colorCuerpo);
    }

    // Cuerpo
    dibujarCirculo(x, y, tam * 0.9, colorCuerpo);

    // Cabeza
    var cabezaX = x;
    var cabezaY = y - tam * 1.15;
    var radio = tam * 0.7;
    dibujarCirculo(cabezaX, cabezaY, radio, colorCuerpo);

    // Orejas (triángulos)
    dibujarTriangulo(
        cabezaX - radio * 0.9, cabezaY - radio * 0.2,
        cabezaX - radio * 0.7, cabezaY - radio * 1.4,
        cabezaX - radio * 0.1, cabezaY - radio * 0.8,
        colorCuerpo
    );
    dibujarTriangulo(
        cabezaX + radio * 0.9, cabezaY - radio * 0.2,
        cabezaX + radio * 0.7, cabezaY - radio * 1.4,
        cabezaX + radio * 0.1, cabezaY - radio * 0.8,
        colorCuerpo
    );

    // Ojos: condicional para ojos abiertos o cerrados
    var ojoY = cabezaY - radio * 0.05;
    var ojoIzqX = cabezaX - radio * 0.38;
    var ojoDerX = cabezaX + radio * 0.38;

    if (despierto === true) {
        dibujarCirculo(ojoIzqX, ojoY, radio * 0.2, colores[6]);
        dibujarCirculo(ojoDerX, ojoY, radio * 0.2, colores[6]);

        // Pupilas alargadas
        ctx.fillStyle = "#100B18";
        ctx.fillRect(ojoIzqX - 1.5, ojoY - radio * 0.2, 3, radio * 0.4);
        ctx.fillRect(ojoDerX - 1.5, ojoY - radio * 0.2, 3, radio * 0.4);
    } else {
        // Ojos cerrados: dos rayitas
        dibujarLinea(ojoIzqX - radio * 0.18, ojoY, ojoIzqX + radio * 0.18, ojoY, colores[6], 2);
        dibujarLinea(ojoDerX - radio * 0.18, ojoY, ojoDerX + radio * 0.18, ojoY, colores[6], 2);
    }

    // Nariz (triángulo pequeño)
    dibujarTriangulo(
        cabezaX - radio * 0.12, cabezaY + radio * 0.25,
        cabezaX + radio * 0.12, cabezaY + radio * 0.25,
        cabezaX, cabezaY + radio * 0.4,
        "#F5A3C7"
    );

    // Bigotes
    ctx.globalAlpha = 0.7;
    dibujarLinea(cabezaX - radio * 0.25, cabezaY + radio * 0.45, cabezaX - radio * 1.1, cabezaY + radio * 0.35, colores[2], 1);
    dibujarLinea(cabezaX - radio * 0.25, cabezaY + radio * 0.55, cabezaX - radio * 1.1, cabezaY + radio * 0.65, colores[2], 1);
    dibujarLinea(cabezaX + radio * 0.25, cabezaY + radio * 0.45, cabezaX + radio * 1.1, cabezaY + radio * 0.35, colores[2], 1);
    dibujarLinea(cabezaX + radio * 0.25, cabezaY + radio * 0.55, cabezaX + radio * 1.1, cabezaY + radio * 0.65, colores[2], 1);
    ctx.globalAlpha = 1;
}

// Dibuja todos los gatos con un bucle for
function dibujarGatos() {
    var colores = paletas[paletaActual];

    for (var i = 0; i < totalGatos; i++) {
        var colorGato;

        // Condicional: alterna el color de los gatos
        if (i % 2 === 0) {
            colorGato = colores[4];
        } else {
            colorGato = colores[5];
        }

        dibujarGato(gatosX[i], gatosY[i], gatosTam[i], gatosLado[i], gatosDespierto[i], colorGato);
    }
}

// Marco decorativo
function dibujarMarco() {
    var colores = paletas[paletaActual];
    ctx.strokeStyle = colores[2];
    ctx.lineWidth = 3;
    ctx.strokeRect(15, 15, ancho - 30, alto - 30);
}

// Textos dentro del Canvas
function dibujarTextos() {
    var colores = paletas[paletaActual];

    ctx.textAlign = "center";

    ctx.fillStyle = colores[2];
    ctx.font = "bold 50px Arial";
    ctx.fillText("NOCHE DE GATOS", ancho / 2, 90);

    ctx.fillStyle = colores[2];
    ctx.font = "20px Arial";
    ctx.fillText("La colonia felina de Cuenca", ancho / 2, 128);

    dibujarLinea(ancho / 2 - 80, 148, ancho / 2 + 80, 148, colores[2], 2);
}

// Dibuja todo en orden
function dibujarTodo() {
    dibujarFondo();
    dibujarLuna();
    dibujarEstrellas();
    dibujarEdificios();
    dibujarGatos();
    dibujarMarco();
    dibujarTextos();
}

// ---------- VARIACIÓN CON Math.random() ----------
function generarComposicion() {
    estrellasX = [];
    estrellasY = [];
    estrellasTam = [];
    edificiosAncho = [];
    edificiosAlto = [];
    edificiosLuz = [];
    gatosX = [];
    gatosY = [];
    gatosTam = [];
    gatosLado = [];
    gatosDespierto = [];

    lunaX = 90 + Math.random() * (ancho - 180);
    lunaY = 210 + Math.random() * 80;

    for (var i = 0; i < totalEstrellas; i++) {
        estrellasX.push(30 + Math.random() * (ancho - 60));
        estrellasY.push(170 + Math.random() * (horizonte - 200));
        estrellasTam.push(1.5 + Math.random() * 3);
    }

    for (var j = 0; j < totalEdificios; j++) {
        edificiosAncho.push(45 + Math.random() * 35);
        edificiosAlto.push(60 + Math.random() * 120);
        edificiosLuz.push(Math.random() > 0.4);
    }

    // Los gatos se ubican en filas: los de abajo son más grandes
    for (var k = 0; k < totalGatos; k++) {
        var fila = k / (totalGatos - 1);
        gatosY.push(horizonte + 55 + fila * 100);
        gatosTam.push(22 + fila * 22);
        gatosX.push(70 + Math.random() * (ancho - 170));

        if (Math.random() > 0.5) {
            gatosLado.push(1);
        } else {
            gatosLado.push(-1);
        }

        gatosDespierto.push(Math.random() > 0.3);
    }

    dibujarTodo();
}

// ---------- EXPORTAR PNG ----------
function exportarPNG() {
    var enlace = document.createElement("a");
    enlace.download = "noche-de-gatos.png";
    enlace.href = canvas.toDataURL("image/png");
    enlace.click();
}

// ---------- EVENTOS ----------
document.getElementById("btnPaleta1").addEventListener("click", function () {
    paletaActual = 0;
    dibujarTodo();
});

document.getElementById("btnPaleta2").addEventListener("click", function () {
    paletaActual = 1;
    dibujarTodo();
});

// La paleta 3 solo se conecta si el botón existe en el HTML
var botonPaleta3 = document.getElementById("btnPaleta3");

if (botonPaleta3 !== null) {
    botonPaleta3.addEventListener("click", function () {
        paletaActual = 2;
        dibujarTodo();
    });
}

document.getElementById("btnGenerar").addEventListener("click", generarComposicion);
document.getElementById("btnPNG").addEventListener("click", exportarPNG);

// Composición inicial al cargar la página
generarComposicion();
