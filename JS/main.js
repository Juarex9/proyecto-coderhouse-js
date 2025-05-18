// Navegación entre secciones (SPA)
const navLinks = document.querySelectorAll('.sidebar a');
const secciones = document.querySelectorAll('.seccion');

navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = link.getAttribute('data-section');

    secciones.forEach(sec => sec.classList.replace('visible', 'hidden'));
    document.getElementById(target).classList.replace('hidden', 'visible');

    switch (target) {
      case 'inicio':
        cargarMovimientos();
        calcularTotales();
        break;
      case 'cuentas':
        mostrarFacturas();
        break;
      case 'ingresos':
      case 'gastos':
        mostrarListasSeparadas();
        break;
      case 'graficos':
        generarGraficos?.();
        generarGraficoDeCategorias?.();
        break;
    }

    navLinks.forEach(l => l.parentElement.classList.remove('active'));
    link.parentElement.classList.add('active');
  });
});

const formulario = document.getElementById('formulario');
const tablaMovimientos = document.getElementById('tabla-movimientos');

if (formulario) {
  formulario.addEventListener('submit', (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombre');
    const monto = document.getElementById('monto');
    const fecha = document.getElementById('fecha');
    const tipo = document.getElementById('tipo');
    const vencimiento = document.getElementById('fecha-vencimiento');

    // Limpiar errores anteriores
    [nombre, monto, fecha].forEach(campo => campo.classList.remove('input-error'));
    ['error-nombre', 'error-monto', 'error-fecha'].forEach(id => {
      document.getElementById(id).classList.add('hidden');
    });

    let errores = [];

    const nombreValido = /^[a-zA-ZÁÉÍÓÚáéíóúÑñ\s]+$/;

    if (!nombre.value.trim() || !nombreValido.test(nombre.value.trim())) {
      nombre.classList.add('input-error');
      document.getElementById('error-nombre').textContent = '⚠️ Ingresá un nombre válido (solo letras).';
      document.getElementById('error-nombre').classList.remove('hidden');
      errores.push("nombre");
    }

    if (isNaN(parseFloat(monto.value)) || parseFloat(monto.value) <= 0) {
      monto.classList.add('input-error');
      document.getElementById('error-monto').classList.remove('hidden');
      errores.push("monto");
    }

    if (!fecha.value) {
      fecha.classList.add('input-error');
      document.getElementById('error-fecha').classList.remove('hidden');
      errores.push("fecha");
    }

    if (errores.length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'Datos incompletos',
        text: 'Por favor, corregí los campos marcados.'
      });
      return;
    }

    const nuevoMovimiento = {
      tipo: tipo.value,
      nombre: nombre.value.trim(),
      monto: parseFloat(monto.value),
      fecha: fecha.value,
      vencimiento: vencimiento.value
    };

    agregarMovimiento(nuevoMovimiento.tipo, nuevoMovimiento.nombre, nuevoMovimiento.monto, nuevoMovimiento.fecha);

    const movimientos = recuperarLocalStorage();
    movimientos.push(nuevoMovimiento);
    guardarLocalStorage(movimientos);

    calcularTotales();
    formulario.reset();

    Swal.fire({
      icon: 'success',
      title: 'Movimiento agregado',
      text: `Se registró un nuevo ${nuevoMovimiento.tipo}.`,
      timer: 2000,
      showConfirmButton: false
    });
  });
}

function agregarMovimiento(tipo, nombre, monto, fecha) {
  const fila = document.createElement('tr');
  fila.innerHTML = `<td>${tipo}</td><td>${nombre}</td><td>$${monto}</td><td>${fecha}</td>`;
  tablaMovimientos.appendChild(fila);
}

function guardarLocalStorage(movs) {
  localStorage.setItem('movimientos', JSON.stringify(movs));
}

function recuperarLocalStorage() {
  const guardados = JSON.parse(localStorage.getItem('movimientos'));
  return guardados || [];
}

function cargarMovimientos() {
  const movimientos = recuperarLocalStorage();
  tablaMovimientos.innerHTML = '';
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

function mostrarFacturas() {
  const movimientos = recuperarLocalStorage();
  const facturas = movimientos.filter(mov => mov.tipo === 'factura');
  const tbody = document.getElementById('tabla-facturas');

  if (tbody) {
    tbody.innerHTML = '';
    facturas.forEach(fac => {
      const fila = document.createElement('tr');
      fila.innerHTML = `<td>${fac.nombre}</td><td>$${fac.monto}</td><td>${fac.fecha}</td><td>${fac.vencimiento}</td>`;
      tbody.appendChild(fila);
    });
  }
}

function mostrarListasSeparadas() {
  const movimientos = recuperarLocalStorage();
  const ingresos = movimientos.filter(m => m.tipo === 'ingreso');
  const gastos = movimientos.filter(m => m.tipo === 'gasto-dia');

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

  const ctxIngresos = document.getElementById('grafico-ingresos')?.getContext('2d');
  const ctxGastos = document.getElementById('grafico-gastos')?.getContext('2d');

  if (ctxIngresos) {
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
          legend: { position: 'top' }
        }
      }
    });
  }

  if (ctxGastos) {
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
          legend: { position: 'top' }
        }
      }
    });
  }
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

  const ctx = document.getElementById("grafico-categorias-gastos")?.getContext("2d");
  if (ctx) {
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
          legend: { position: 'top' }
        }
      }
    });
  }
}


const btnEliminar = document.getElementById('borrar-datos');
if (btnEliminar) {
  btnEliminar.addEventListener('click', () => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esto eliminará todos los movimientos guardados.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
      customClass: {
        actions: 'espaciado-botones'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('movimientos');
        location.reload();
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  cargarMovimientos();
  calcularTotales();
  mostrarFacturas();
  mostrarListasSeparadas();
  generarGraficos?.();
  generarGraficoDeCategorias?.();
});
