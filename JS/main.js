// Seleccionar elementos
const tablaMovimientos = document.getElementById('tabla-movimientos');
const formulario = document.getElementById('formulario');

// Funcion para agregar un movimiento a la tabla
function agregarMovimiento(tipo, nombre, monto, fecha) {
  const fila = document.createElement('tr');

  fila.innerHTML = `
        <td>${tipo}</td>
        <td>${nombre}</td>
        <td>$${monto}</td>
        <td>${fecha}</td>
    `;

  tablaMovimientos.append(fila);
}

// Manejar el envío del formulario
formulario.addEventListener('submit', (event) => {
  event.preventDefault();

  const tipo = document.getElementById('tipo').value;
  const nombre = document.getElementById('nombre').value;
  const monto = parseFloat(document.getElementById('monto').value);
  const fecha = document.getElementById('fecha').value;

  agregarMovimiento(tipo, nombre, monto, fecha);

  const movimientos = recuperarLocalStorage();
  movimientos.push({ tipo, nombre, monto, fecha });
  guardarLocalStorage(movimientos);

  calcularTotales(); 
  formulario.reset();
});

// Funcion para guardar movimientos en localStorage
function guardarLocalStorage(movimientos) {
  localStorage.setItem('movimientos', JSON.stringify(movimientos));
}

// Funcion para recuperar movimientos de localStorage
function recuperarLocalStorage() {
  let movimientosGuardados = JSON.parse(localStorage.getItem('movimientos'));
  if (movimientosGuardados === null) {
    return [];
  }
  return movimientosGuardados;
}

// Funcion para recupear los movimientos del localStorage y cargarlos en la tabla
function cargarMovimientos() {
  const movimientos = recuperarLocalStorage();
  movimientos.forEach(movimiento => {
    agregarMovimiento(movimiento.tipo, movimiento.nombre, movimiento.monto, movimiento.fecha);
  });
}

// Funcion para calcular totales
function calcularTotales() {
  const movimientos = recuperarLocalStorage();
  let totalIngreso = 0;
  let totalEgreso = 0;

  movimientos.forEach(movimiento => {
    if (movimiento.tipo === 'ingreso') {
      totalIngreso += movimiento.monto;
    } else if (movimiento.tipo === 'gasto') {
      totalEgreso += movimiento.monto;
    }
  });
  const saldoDisponible = totalIngreso - totalEgreso;
  document.getElementById('saldo').innerText = `${saldoDisponible}`;
  document.getElementById('total-ingresos').innerText = `${totalIngreso}`;
  document.getElementById('total-gastos').innerText = `${totalEgreso}`;
}

// Cargar movimientos y totales al iniciar la página
document.addEventListener('DOMContentLoaded', () => {
  cargarMovimientos();
  calcularTotales();
});

// Agregar evento de clic al botón de eliminar
const btnEliminar = document.getElementById('borrar-datos');
btnEliminar.addEventListener('click', () => {
  const confirmacion = confirm('¿Estás seguro de que deseas eliminar todos los datos?');
  if (confirmacion) {
    localStorage.removeItem('movimientos');
    tablaMovimientos.innerHTML = '';
    document.getElementById('saldo').innerText = '0';
    document.getElementById('total-ingresos').innerText = '0';
    document.getElementById('total-gastos').innerText = '0';
  }
});