function addPresupuesto() {
    const nombreUsuario = prompt('¿Cuál es tu nombre?');
    const presupuestoTotal = parseFloat(prompt('¿Cuál es tu presupuesto total?'));
    let gastos = [];
    let agregarGasto = true;

    while (agregarGasto) {
        let gasto = prompt('Ingresa un gasto (0 para terminar):');
        if (gasto !== '0') {
            gastos.push(gasto);
        } else {
            agregarGasto = false;
        }
    }

    const totalGastosNumericos = gastos
        .filter(gasto => !isNaN(parseFloat(gasto)))
        .reduce((acc, gasto) => acc + parseFloat(gasto), 0);

    const presupuestoDisponible = presupuestoTotal - totalGastosNumericos;

    alert(`
        ${nombreUsuario} tu presupuesto para gastar es:
        Presupuesto: ${presupuestoDisponible},
        ${nombreUsuario} debes pagar los siguientes gastos:
        Gastos: ${gastos.join(', ')}
    `);
}

function presupuestoView(nombre = '', presupuestoTotal = 0, gastos = 0, presupuestoDispo = 0) {
    console.log(`nombre: ${nombre}, presupuesto total: ${presupuestoTotal}, gastos: ${gastos}, presupuesto disponible: ${presupuestoDispo}`);
}

addPresupuesto();