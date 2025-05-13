// Navegación entre secciones (SPA)
const navLinks = document.querySelectorAll('.sidebar a');
const secciones = document.querySelectorAll('.seccion');

navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = link.getAttribute('data-section');

    // Mostrar solo la sección correspondiente
    secciones.forEach(sec => {
      sec.classList.remove('visible');
      sec.classList.add('hidden');
    });

    document.getElementById(target).classList.remove('hidden');
    document.getElementById(target).classList.add('visible');

    // Estilo activo en el menú
    navLinks.forEach(l => l.parentElement.classList.remove('active'));
    link.parentElement.classList.add('active');
  });
});

// Seleccionar elementos
const tablaMovimientos = document.getElementById('tabla-movimientos');
const formulario = document.getElementById('formulario');

if (formulario) {
  formulario.addEventListener('submit', (e) => {
    e.preventDefault();
    const tipo = document.getElementById('tipo').value;
    const nombre = document.getElementById('nombre').value;
    const monto = parseFloat(document.getElementById('monto').value);
    const fecha = document.getElementById('fecha').value;
    const vencimiento = document.getElementById('fecha-vencimiento').value;

    agregarMovimiento(tipo, nombre, monto, fecha);

    const movimientos = recuperarLocalStorage();
    movimientos.push({ tipo, nombre, monto, fecha, vencimiento });
    guardarLocalStorage(movimientos);

    calcularTotales();
    formulario.reset();
  });
}


// Agregar fila de movimiento
function agregarMovimiento(tipo, nombre, monto, fecha) {
  const fila = document.createElement('tr');
  fila.innerHTML = `
    <td>${tipo}</td>
    <td>${nombre}</td>
    <td>$${monto}</td>
    <td>${fecha}</td>
  `;
  tablaMovimientos.appendChild(fila);
}

// Envío del formulario
formulario.addEventListener('submit', (e) => {
  e.preventDefault();
  const tipo = document.getElementById('tipo').value;
  const nombre = document.getElementById('nombre').value;
  const monto = parseFloat(document.getElementById('monto').value);
  const fecha = document.getElementById('fecha').value;
  const vencimiento = document.getElementById('fecha-vencimiento').value;

  agregarMovimiento(tipo, nombre, monto, fecha);

  const movimientos = recuperarLocalStorage();
  movimientos.push({ tipo, nombre, monto, fecha, vencimiento });
  guardarLocalStorage(movimientos);

  calcularTotales();
  formulario.reset();
});

function guardarLocalStorage(movs) {
  localStorage.setItem('movimientos', JSON.stringify(movs));
}

function recuperarLocalStorage() {
  const guardados = JSON.parse(localStorage.getItem('movimientos'));
  return guardados || [];
}

function cargarMovimientos() {
  const movimientos = recuperarLocalStorage();
  movimientos.forEach(mov => {
    agregarMovimiento(mov.tipo, mov.nombre, mov.monto, mov.fecha);
  });
}

function calcularTotales() {
  const movimientos = recuperarLocalStorage();
  let ingresos = 0, egresos = 0;

  movimientos.forEach(mov => {
    if (mov.tipo === 'ingreso') ingresos += mov.monto;
    else egresos += mov.monto;
  });

  document.getElementById('total-ingresos').innerText = ingresos;
  document.getElementById('total-gastos').innerText = egresos;
  document.getElementById('saldo').innerText = ingresos - egresos;
}

// Mostrar cuentas a pagar (facturas)
function mostrarFacturas() {
  const movimientos = recuperarLocalStorage();
  const facturas = movimientos.filter(mov => mov.tipo === 'factura');
  const tbody = document.getElementById('tabla-facturas');

  if (tbody) {
    tbody.innerHTML = '';
    facturas.forEach(fac => {
      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td>${fac.nombre}</td>
        <td>$${fac.monto}</td>
        <td>${fac.fecha}</td>
        <td>${fac.vencimiento}</td>
      `;
      tbody.appendChild(fila);
    });
  }
}

// Mostrar ingresos y gastos separados
function mostrarListasSeparadas() {
  const movimientos = recuperarLocalStorage();
  const ingresos = movimientos.filter(m => m.tipo === 'ingreso');
  const gastos = movimientos.filter(m => m.tipo !== 'ingreso' && m.tipo !== 'factura');

  const tbodyIng = document.getElementById('tabla-ingresos');
  const tbodyGas = document.getElementById('tabla-gastos');

  if (tbodyIng) {
    tbodyIng.innerHTML = '';
    ingresos.forEach(m => {
      const fila = document.createElement('tr');
      fila.innerHTML = `<td>${m.nombre}</td><td>$${m.monto}</td><td>${m.fecha}</td>`;
      tbodyIng.appendChild(fila);
    });
  }

  if (tbodyGas) {
    tbodyGas.innerHTML = '';
    gastos.forEach(m => {
      const fila = document.createElement('tr');
      fila.innerHTML = `<td>${m.nombre}</td><td>$${m.monto}</td><td>${m.fecha}</td>`;
      tbodyGas.appendChild(fila);
    });
  }
}

// Calcular ahorro
function calcularAhorro() {
  const porcentaje = parseFloat(document.getElementById('porcentaje-ahorro').value);
  const totalIngresos = recuperarLocalStorage().filter(m => m.tipo === 'ingreso')
    .reduce((acc, curr) => acc + curr.monto, 0);
  const ahorro = totalIngresos * (porcentaje / 100);
  document.getElementById('total-ahorro').innerText = ahorro.toFixed(2);
}

// Borrar datos
const btnEliminar = document.getElementById('borrar-datos');
if (btnEliminar) {
  btnEliminar.addEventListener('click', () => {
    if (confirm('¿Eliminar todos los datos?')) {
      localStorage.removeItem('movimientos');
      location.reload();
    }
  });
}

// Al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  cargarMovimientos();
  calcularTotales();
  mostrarFacturas();
  mostrarListasSeparadas();
  generarGraficos();
  generarGraficoDeCategorias();
});

// Graficos 
function generarGraficos() {
  const movimientos = recuperarLocalStorage();

  const ingresosPorMes = {};
  const gastosPorMes = {};

  movimientos.forEach(mov => {
    const mes = mov.fecha?.substring(0, 7); // yyyy-mm
    if (!mes) return;

    if (mov.tipo === 'ingreso') {
      ingresosPorMes[mes] = (ingresosPorMes[mes] || 0) + mov.monto;
    } else if (mov.tipo === 'gasto-dia' || mov.tipo === 'factura') {
      gastosPorMes[mes] = (gastosPorMes[mes] || 0) + mov.monto;
    }
  });

  const meses = Array.from(new Set([...Object.keys(ingresosPorMes), ...Object.keys(gastosPorMes)])).sort();

  const dataIngresos = meses.map(m => ingresosPorMes[m] || 0);
  const dataGastos = meses.map(m => gastosPorMes[m] || 0);

  // Crear gráfico de ingresos
  const ctxIngresos = document.getElementById('grafico-ingresos').getContext('2d');
  new Chart(ctxIngresos, {
    type: 'bar',
    data: {
      labels: meses,
      datasets: [{
        label: 'Ingresos mensuales',
        data: dataIngresos,
        backgroundColor: 'rgba(0, 200, 100, 0.5)',
        borderColor: 'green',
        borderWidth: 1
      }]
    },
    options: {
      responsive: false,
      maintainAspectRatio: false,
      plugins: {
        legend: {
        position: 'top'
      }
    }
  }
  });

  // Crear gráfico de gastos
  const ctxGastos = document.getElementById('grafico-gastos').getContext('2d');
  new Chart(ctxGastos, {
    type: 'bar',
    data: {
      labels: meses,
      datasets: [{
        label: 'Gastos mensuales',
        data: dataGastos,
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'red',
        borderWidth: 1
      }]
    },
    options: {
      responsive: false,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top'
        }
      }
    }
  });
}
function generarGraficoDeCategorias() {
  const movimientos = recuperarLocalStorage();

  const categorias = {
    "factura": 0,
    "gasto-dia": 0
  };

  movimientos.forEach(mov => {
    if (mov.tipo === "factura" || mov.tipo === "gasto-dia") {
      categorias[mov.tipo] += mov.monto;
    }
  });

  const labels = Object.keys(categorias).map(cat => {
    if (cat === "factura") return "Facturas";
    if (cat === "gasto-dia") return "Gastos del día";
    return cat;
  });

  const data = Object.values(categorias);

  const ctx = document.getElementById("grafico-categorias-gastos").getContext("2d");
  new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [{
        label: "Distribución de gastos",
        data: data,
        backgroundColor: [
          "rgba(255, 159, 64, 0.6)",
          "rgba(54, 162, 235, 0.6)"
        ],
        borderColor: [
          "rgba(255, 159, 64, 1)",
          "rgba(54, 162, 235, 1)"
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: false,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top'
        }
      }
    }
  });
}

