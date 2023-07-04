
  
  // Configuración de Flatpickr
  const fechaPicker = flatpickr('#fechaPicker', {
    dateFormat: 'd/m/Y',
    mode: 'range', // Habilitar el modo de selección de rango de fechas
    onChange: function(selectedDates, dateStr) {
      filterTableByDate(selectedDates);
     
    }
  });
  
  
  let originalData = []; // Variable para almacenar los datos originales de la API
  
  // Cargar los datos de la API al cargar la página
  window.onload = function() {
    fetch('http://127.0.0.1:7777')
      .then(response => {
        if (!response.ok) {
          throw new Error('Error al cargar los datos de la API: ' + response.status);
        }
        return response.json();
      })
      .then(data => {
        originalData = data; // Almacenar los datos originales
        updateTable(originalData); // Cargar la tabla con todos los datos
        updateDataList(originalData); // Actualizar el data list con los comercios
       
      })
      .catch(error => {
        console.log('Error al obtener los datos:', error);
      });
  
    
      const cargarTablaCompletaBtn = document.getElementById('cargarTablaCompleta');
  
    cargarTablaCompletaBtn.addEventListener('click', function() {
      updateTable(originalData);
      
    });
  }

  function updateDataList(data) {
    const comercioFilter = document.getElementById('comercioFilter');
    const comercios = new Set(); // Utilizamos un Set para evitar duplicados
  
    // Agregar la opción de "todos los comercios" al inicio del data list
    const optionTodos = document.createElement('option');
    optionTodos.value = 'todos';
    optionTodos.text = 'Todos los comercios';
    comercioFilter.appendChild(optionTodos);
  
    data.forEach(item => {
      const comercioNombre = item.orden.comercio.nombre;
      comercios.add(comercioNombre);
    });
  
    comercios.forEach(comercio => {
      const option = document.createElement('option');
      option.value = comercio;
      option.text = comercio;
      comercioFilter.appendChild(option);
    });
  }
  

  
  
  function isSameDate(date1, date2) {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }
  
  function isInRange(date, startDate, endDate) {
    return date >= startDate && date <= endDate || isSameDate(date, startDate) || isSameDate(date, endDate);
  }
  
  // Función auxiliar para eliminar acentos
  function removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }
  

  function filterTableByDate(selectedDates) {
    const startDate = selectedDates[0];
    const endDate = selectedDates.length > 1 ? selectedDates[1] : selectedDates[0];
  
    const selectedComercio = document.getElementById('comercioFilter').value; // Obtener el valor seleccionado del filtro de comercio
    const selectedEstado = document.getElementById('estadoFilter').value; // Obtener el valor seleccionado del filtro de estado
  
    const rows = document.querySelectorAll('.table-container table tbody tr');
  
    rows.forEach(row => {
      const fechaCell = row.querySelector('td:nth-child(2)'); // Obtener la celda de fecha en la fila
      const fechaText = fechaCell.innerText.trim();
      const fecha = new Date(fechaText);
  
      const comercioCell = row.querySelector('td:nth-child(4)'); // Obtener la celda de comercio en la fila
      const comercioText = comercioCell.innerText.trim();
  
      const estadoCell = row.querySelector('td:nth-child(14)'); // Obtener la celda de estado en la fila
      const estadoText = estadoCell.innerText.trim();
  
      const rowVisible = isInRange(fecha, startDate, endDate) &&
        (selectedComercio === 'todos' || (selectedComercio === '' || removeAccents(comercioText.toLowerCase()) === removeAccents(selectedComercio.toLowerCase()))) &&
        (selectedEstado === '' || estadoText.toLowerCase() === selectedEstado.toLowerCase()); // Verificar si la fila cumple con el rango de fechas, comercio seleccionado y estado seleccionado
  
      row.style.display = rowVisible ? 'table-row' : 'none';
    });
  }
  
  
  //aproximando numero para formulas
  
  function roundToTwoDecimals(number) {
    return parseFloat(number.toFixed(2));
  }
  
  
  function updateTable(data) {
    const tablaBody = document.querySelector('.table-container table tbody');
    const fragment = document.createDocumentFragment(); // Crea un Document Fragment
  
    
    data.forEach((item, index) => {
      const detalles = item.detOrdenList;
      const orden = item.orden;
  
       // Verificar si la fecha es posterior o igual al 7 de junio
       const fechaOrden = new Date(orden.fechaOrden);
       const fechaLimite = new Date('2023-06-07');
       if (fechaOrden <= fechaLimite) {
         return; // Salir del bucle si la fecha es anterior o igual
       }
  
   // Monto Comisión Weris (sin IVA)
   const montoSinIVA = parseFloat((orden.subtotal * (orden.comercio.tipoComision.porcentaje / 100)).toFixed(2));
   const montoSinIVARounded = roundToTwoDecimals(montoSinIVA);
  
    // Monto Comisión Weris (IVA Incluido)
    const montoConIVA = parseFloat((orden.subtotal * ((orden.comercio.tipoComision.porcentaje / 100) + ((orden.comercio.tipoComision.porcentaje / 100) * 0.13))).toFixed(2));
    const montoConIVARounded = roundToTwoDecimals(montoConIVA);
  
    // pago comercio
    const pagoCom = orden.subtotal - montoConIVA;
    const pagoComercio = roundToTwoDecimals(pagoCom)
    // IVA
    const IVA = (montoConIVA - montoSinIVA).toFixed(2);
  
  



    const comercioNombre = removeAccents(orden.comercio.nombre.toLowerCase()); // Obtener el nombre del comercio en minúsculas y sin acentos

      const row = document.createElement('tr'); // Crea una fila de la tabla 
      
      row.setAttribute('data-id-orden', orden.idOrden);
      // Añade las celdas a la fila
      row.innerHTML = `
      <td>${index + 1}</td> <!-- Columna de contador -->
      <td>${orden.fechaOrden}</td>
      <!-- Id orden	 --> 
      <td>${orden.idOrden}</td>
      <!-- comercio	 --> 
      <td>${orden.comercio.nombre}</td>
      <!-- Sucursal	 --> 
      <td>${orden.caja.comercioSucursal.nombre}</td>
      <!-- Forma de pago	 --> 
      <td>${orden.formaPago.nombre}</td>
      <!-- Pago consumidor total	  -->
      <td>$ ${orden.total}</td>
      <!-- Venta comercio	  -->
      <td>$ ${orden.subtotal}</td>
      <!-- Comision weris  %   -->
      <td>${orden.comercio.tipoComision.porcentaje}&percnt;</td>
      <!-- Monto Comisión Weris (sin IVA)	 -->
      <td> ${montoSinIVARounded}</td>
      <!-- Monto Comisión Weris (IVA Incluido)  -->
      <td>${montoConIVARounded}</td>
      <!-- IVA -->
      <td>${IVA}</td>
      <!-- Pago comercio  -->
      <td>$ ${pagoComercio}</td>
      <!-- Estado orden  -->
       <td>${orden.estadoOrden.nombre}</td>
     
  
      `;
  // Agregar un atributo "data-comercio" al elemento tr con el nombre del comercio en minúsculas y sin acentos
  row.setAttribute('data-comercio', comercioNombre);

      fragment.appendChild(row); // Agrega la fila al Document Fragment
    });
  
    tablaBody.innerHTML = ''; // Borra el contenido existente de la tabla
    tablaBody.appendChild(fragment); // Adjunta el Document Fragment al DOM en un solo paso
    
  }
  
//exportando documentos a exel
  function exportToExcel() {
    const visibleRows = Array.from(document.querySelectorAll('.table-container table tbody tr'))
      .filter(row => row.style.display !== 'none');
  
    if (visibleRows.length === 0) {
      console.log('No hay filas visibles para exportar');
      return;
    }
  
    const filteredTable = document.createElement('table');
    const tableHeader = filteredTable.createTHead();
    const headerRow = tableHeader.insertRow();
  
    // Agregar encabezados de columna a la nueva tabla
    const columnHeaders = Array.from(document.querySelectorAll('.table-container table thead th'))
      .map(th => th.textContent.trim());
    for (let i = 0; i < columnHeaders.length; i++) {
      const headerCell = document.createElement('th');
      headerCell.textContent = columnHeaders[i];
      headerRow.appendChild(headerCell);
    }
  
    const tableBody = filteredTable.createTBody();
  
    // Copiar las filas visibles a la nueva tabla
    for (let i = 0; i < visibleRows.length; i++) {
      const visibleRow = visibleRows[i];
      const newRow = tableBody.insertRow();
  
      const cells = Array.from(visibleRow.querySelectorAll('td'));
      for (let j = 0; j < cells.length; j++) {
        const cell = cells[j];
        const newCell = newRow.insertCell();
        newCell.innerHTML = cell.innerHTML;
      }
    }
  
    const workbook = XLSX.utils.table_to_book(filteredTable);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
    const fileName = 'tabla_excel.xlsx';
    if (navigator.msSaveBlob) {
      navigator.msSaveBlob(data, fileName);
    } else {
      const link = document.createElement('a');
      document.body.appendChild(link);
      link.href = window.URL.createObjectURL(data);
      link.download = fileName;
      link.click();
      document.body.removeChild(link);
    }
  }

// Función para formatear la fecha
function formatDate(date) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('es', options);
}


// Función para formatear un número como moneda
function formatCurrency(amount) {
  // Formatear el número con el símbolo de dólar y separadores de miles
  return `$${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

function formatPercentage(value) {
  return `${value}%`
}





// pdf individual

document.getElementById('generarPDF_individual').addEventListener('click', function() {
  // Obtener todas las filas visibles de la tabla
  const rows = document.querySelectorAll('.table-container table tbody tr[style="display: table-row;"]');

  // Agrupar las filas por comercio
  const rowsByComercio = {};
  rows.forEach(row => {
    const comercio = row.getAttribute('data-comercio');
    if (!rowsByComercio[comercio]) {
      rowsByComercio[comercio] = [];
    }
    rowsByComercio[comercio].push(row);
  });


// Obtener las fechas seleccionadas
const selectedDates = fechaPicker.selectedDates;
let fechaCorteFormatted;

if (selectedDates.length === 1) {
  // Si solo se seleccionó un día, mostrar esa fecha
  const fechaCorte = selectedDates[0];
  fechaCorteFormatted = fechaCorte.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
} else if (selectedDates.length > 1) {
  // Si se seleccionó un rango de fechas, mostrar el rango en el formato "día inicial" al "día final" de "mes" de "año"
  const fechaInicio = selectedDates[0];
  const fechaFin = selectedDates[selectedDates.length - 1];
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  
  if (fechaInicio.getTime() === fechaFin.getTime()) {
    // Si la fecha de inicio y la fecha de fin son iguales, mostrar solo una vez la fecha
    fechaCorteFormatted = fechaInicio.toLocaleDateString('es-MX', options);
  } else {
    fechaCorteFormatted = `${fechaInicio.toLocaleDateString('es-MX', options)} al ${fechaFin.toLocaleDateString('es-MX', options)}`;
  }
} else {
  // Si no se seleccionó ninguna fecha, mostrar un mensaje de error
  alert('Seleccione una fecha o un rango de fechas');
  return;
}


 // Crear un objeto ZIP
 const zip = new JSZip();



  // Generar un PDF por comercio
  Object.entries(rowsByComercio).forEach(([comercio, rows]) => {
    
    

  const doc = new jsPDF();
  

  
  const img = new Image()
  img.src = './pdf.png'    
  doc.addImage(img, 'PNG', 175, 15, 25, 25)



    doc.setFontSize(11);
    doc.setFontStyle('bold');
    doc.text('Estado de cuenta', 85,20);
    doc.text('Reporte con informacion ficticia de comercios en el país', 50,30);
    doc.text(`del ${fechaCorteFormatted}`, 60, 37); // Agregar la fecha de corte al PDF
    doc.setFontStyle('normal');

    const sucursalNombre = rows[0].querySelector('td:nth-child(5)').innerText.trim();
   
    // doc.text(`Razón social: ${razonSocial}`, 15, 50);
    doc.text("Razón social:", 15, 50);
    doc.text(`Nombre comercial - ${comercio}`, 15, 57);
    doc.text(`Sucursal: ${sucursalNombre}`, 15, 65);

   
    


    let totalLIQUIDOAPAGAR = 0; // Variable para almacenar la suma de los pagos comercio
    let totalcomisionSINIVA = 0;
    let totalIVAcomision = 0;
    let totalTOTALComision = 0;
    let totalVentasComercio = 0;
   

    const tableData = rows.map(row => {
      // Obteniendo la fecha en formato original (ejemplo: "2023-06-19")
      const fechaOriginal = row.querySelector('td:nth-child(2)').innerText.trim();
    
      // Convirtiendo la fecha original a un objeto Date
      const fechaObjeto = new Date(fechaOriginal);
    
      // Obteniendo los componentes de la fecha
      const dia = fechaObjeto.getDate();
      const mes = fechaObjeto.getMonth() + 1; // Los meses en JavaScript son base 0, por lo que se suma 1
      const anio = fechaObjeto.getFullYear();
    
      // Formateando la fecha en el formato "dd/mm/yyyy"
        const fechaFormateada = `${dia.toString().padStart(2, '0')}/${mes.toString().padStart(2, '0')}/${anio}`;
    
       //obteniendo el idOrden
        const idOrden = row.querySelector('td:nth-child(3)').innerText.trim();

      //obteniendo total ventas comercio
        const totalVenta = parseFloat(row.querySelector('td:nth-child(8)').innerText.trim().replace('$', ''));

      //obteniendo comision weris ----- no sumar totales porque no es necesario
        const comisionPactada = parseFloat(row.querySelector('td:nth-child(9)').innerText.trim().replace('$', ''));

      //obteniendo monto comision weris SIN IVA
        const comisionSINIVA = parseFloat(row.querySelector('td:nth-child(10)').innerText.trim().replace('$', ''));

       //obteniendo monto IVA
        const IVAporcomision = parseFloat(row.querySelector('td:nth-child(12)').innerText.trim().replace('$', ''));

        //obteniendo comision weris con IVA
        const TOTALcomision = parseFloat(row.querySelector('td:nth-child(11)').innerText.trim().replace('$', ''));


       // Obtener los datos de cada fila
        const liquidoaPagar = parseFloat(row.querySelector('td:nth-child(13)').innerText.trim().replace('$', ''));

       // Sumar de los totales
       
       totalVentasComercio += totalVenta;
       totalcomisionSINIVA += comisionSINIVA;
       totalIVAcomision += IVAporcomision;
       totalTOTALComision += TOTALcomision;
       totalLIQUIDOAPAGAR += liquidoaPagar;


      return [fechaFormateada,idOrden,formatCurrency(totalVenta),formatPercentage(comisionPactada),formatCurrency(comisionSINIVA),formatCurrency(IVAporcomision),formatCurrency(TOTALcomision), formatCurrency(liquidoaPagar)];
    });
    


    
    const maxRowsPerPage = 17; // Número máximo de filas por página
    let startY = 70; // Posición inicial de la tabla
    let tableDataPage;
    
    // Agregar la fila del total de pagos comercio a tableData
    const totalRow = [
      { content: 'TOTALES', colSpan: 1 },
      '',
      { content: `$${totalVentasComercio.toFixed(2)}` },
      '',
      { content: `$${totalcomisionSINIVA.toFixed(2)}` },
      { content: `$${totalIVAcomision.toFixed(2)}` },
      { content: `$${totalTOTALComision.toFixed(2)}` },
      { content: `$${totalLIQUIDOAPAGAR.toFixed(2)}` }
    ];
    tableData.push(totalRow);


    let currentPage = 1; // Página actual
    
    for (let i = 0; i < tableData.length; i += maxRowsPerPage) {
      tableDataPage = tableData.slice(i, i + maxRowsPerPage);
    
      // Calcular el ancho de cada columna en el footer
      const cellWidths = ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'];


  // Imprimir la tabla en una nueva página si no es la primera página
  if (currentPage > 1) {
    doc.addPage();
    startY = 70; // Reiniciar la posición inicial de la tabla en la nueva página
  }
    

      
      // Imprimir la tabla
      doc.autoTable({
        head: [['Fecha', 'ID de la orden', 'Total venta', '%Comision Pactada', 'Comisión SIN IVA', 'IVA por comisión', 'TOTAL comisión', 'Liquido a Pagar']],
        body: tableDataPage.slice(0, -1), // Excluir la última fila (totalRow) del body
        foot: [tableDataPage[tableDataPage.length - 1]], // Utilizar la última fila (totalRow) como footer
        // foot: [tableData[tableData.length - 1]], // Utilizar la última fila (totalRow) como footer
        startY: startY,
      
        headStyles: {
          fontStyle: 'bold',
          fillColor: [26, 40, 122], // Color de fondo del encabezado de la tabla
          textColor: 255 // Color de texto del encabezado de la tabla
        },
        bodyStyles: {
          textColor: 0 // Color de texto de las filas
        },
        footStyles: {
          fillColor: [26, 40, 122], // Color de fondo del footer
          textColor: 255 // Color de texto del footer
        },
        columnStyles: {
          0: { cellWidth: cellWidths[0] }, // Fecha
          1: { cellWidth: cellWidths[1] }, // ID de la orden
          2: { cellWidth: cellWidths[2] }, // Total venta
          3: { cellWidth: cellWidths[3] }, // %Comision Pactada
          4: { cellWidth: cellWidths[4] }, // Comisión SIN IVA
          5: { cellWidth: cellWidths[5] }, // IVA por comisión
          6: { cellWidth: cellWidths[6] }, // TOTAL comisión
          7: { cellWidth: cellWidths[7] } // Liquido a Pagar
        }, 
      
      });
    
      startY += maxRowsPerPage * 10;
      currentPage++;
    }
    



// Configuración del marco negro
var marginTop = 220; // Margen superior
var marginBottom = 10; // Margen inferior
var width = 195; // Ancho del marco
var height = 40; // Alto del marco

// Dibujo del marco negro
doc.setDrawColor(0, 0, 0); // Color del borde (negro)
doc.setLineWidth(1); // Grosor del borde
doc.rect(10, marginTop, width, height, 'S'); // 'S' indica que solo se dibuje el borde, no el relleno

// Configuración del texto
doc.setFontSize(9);

// Contenido del texto
var texto = [
  "Envío informe para su revisión y aprobación, si tiene observaciones favor comunicarse al número 111111 con christian",
  "Barillas, programador puede comunicarse al correo christianbarillas@gmai.com, dentro de las próximas 24 horas",
  " ",
  "DE NO RECIBIR OBSERVACIONES, christian barillas, DARÁ POR ACEPTADA LA INFORMACION PRESENTA",
  "Y SE REALIZARÁ EL PAGO"
];

// Posición inicial del texto dentro del marco
var x = 15;
var y= marginTop + 10
// var y = marginTop + 10; // Se ajusta para agregar espacio adicional arriba

// Agregar el texto dentro del marco
texto.forEach(function(linea) {
  if (linea.startsWith("DE NO RECIBIR") || (linea.startsWith("Y SE REALIZARÁ EL PAGO"))) {
    doc.setTextColor(0, 0, 0); // Establecer color del texto en negro
    doc.setFontStyle('bold');
  } 
  
  else {
    doc.setTextColor(0, 0, 0); // Establecer color del texto en negro
    doc.setFontStyle('normal');
  }
  doc.text(linea, x, y);
  y += 5; // Espacio entre líneas
});

// Agregar el texto en el pie de página
doc.setFontSize(10);


//correo de weris

doc.setTextColor('#F65420');
doc.setFontStyle('bold');
doc.text("christianbarillasyt@gmail.com", 15, 275);

//pagina de weris 






    // Agregar el PDF generado al ZIP
    const pdfData = doc.output('arraybuffer');
    zip.file(`EstadoCuenta_${comercio}.pdf`, pdfData);
  });

  // Generar el archivo ZIP
  zip.generateAsync({ type: 'blob' })
    .then(function(content) {
      // Descargar el archivo ZIP
      const zipFileName = 'EstadoCuentas.zip';
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = zipFileName;
      link.click();
  
    
  });
});






// //pdf grupal

// document.getElementById('generarPDF_grupal').addEventListener('click', function() {
//   let confirmacion = confirm("Esta es una version Beta, Quieres descargar el PDF ?")

//   if (confirmacion) {
//   const rows = document.querySelectorAll('.table-container table tbody tr[style="display: table-row;"]');

//   const rowsByComercio = {};
//   rows.forEach(row => {
//     const comercio = row.getAttribute('data-comercio');
//     if (!rowsByComercio[comercio]) {
//       rowsByComercio[comercio] = [];
//     }
//     rowsByComercio[comercio].push(row);
//   });

//   const doc = new jsPDF();
//   doc.setFontSize(14);
//   doc.text('Estado de Cuenta - Todos los Comercios', 10, 10);

//   let totalPagosGrupal = 0;

//   Object.entries(rowsByComercio).forEach(([comercio, rows]) => {
//     let totalPagosComercio = 0;

//     const tableData = rows.map(row => {
//       const fecha = row.querySelector('td:nth-child(2)').innerText.trim();
//       const pagoComercio = parseFloat(row.querySelector('td:nth-child(10)').innerText.trim().replace('$', ''));

//       totalPagosComercio += pagoComercio;

//       return [fecha, pagoComercio];
//     });

//     doc.setFontSize(11);
//     doc.text(`Comercio: ${comercio}`, 10, doc.autoTable.previous.finalY + 15);

//     doc.autoTable({
//       head: [['Fecha', 'Pago']],
//       body: tableData,
//       startY: doc.autoTable.previous.finalY + 20,
//       // Agregar un margen inferior después de imprimir la tabla del comercio
//       margin: { bottom: 5 }
//     });

//     doc.setFontSize(11);
//     doc.text(`Total pago Comercio: $${totalPagosComercio.toFixed(2)}`, 10, doc.autoTable.previous.finalY + 5);

//     totalPagosGrupal += totalPagosComercio;
//   });

//   doc.addPage();

//   doc.setFontSize(11);
//   doc.text(`Total pago Grupal: $${totalPagosGrupal.toFixed(2)}`, 10, doc.autoTable.previous.finalY + 20);

//   doc.save('EstadoCuenta_Grupal.pdf');
// }
// });

