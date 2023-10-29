console.log("Cargando fichero script_v2.js"); // Mensaje de consola para indicar la carga del script

// Datos de ejemplo en formato JSON
d3.json("parados_edad_com_t.json").then(function (datosCompletos) {
    
    console.log("Datos cargados parados.js"); // Mensaje de consola para indicar la carga de datos
    console.log(datosCompletos); // Imprime los datos en la consola

  // Selección de variables
  function filtrar(VariableNombre, Nombre, datos) {
    const subconj = [];
    datos.forEach(function (d) {
      const Filtro = d.MetaData.find(meta => meta.Variable.Nombre === VariableNombre);

      if (Filtro && Filtro.Nombre === Nombre) {
        subconj.push(d);
      }
    });
    return subconj;
  }

  datos_tot = filtrar(
    "Sexo",
    "Ambos sexos",
    filtrar("Totales de edad", "Total", datosCompletos)
  );

  console.log(datos_tot);

  // Configuración del gráfico
  const width = 1050;
  const height = 700;
  const margin = {
    left: 90,
    right: 200,
    top: 20,
    bottom: 100,
  };

  // Crear el contenedor SVG
  const svg = d3
    .select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // Obtener las fechas mínima y máxima de tus datos
  const maxDate = d3.max(datos_tot[0].Data, (d) => d.Fecha);
  const minDate = d3.min(datos_tot[0].Data, (d) => d.Fecha);

  // Define las escalas para los ejes X e Y
  const xScale = d3
    .scaleTime()
    .domain([new Date(minDate), new Date(maxDate)]) // Asegúrate de crear objetos Date
    .range([0 + margin.left, width - margin.right]);

  var yScale = d3
    .scaleLinear()
    .domain([0, 0])
    .range([height - margin.bottom, 0 + margin.top]);

    
  const colorScale = d3.scaleLinear()
    .range(["purple", "red", "orange", "green", "blue"])
    .domain([0,4,9,14,19]);

  const mesesEnEspanol = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];

  // Función personalizada para formatear la fecha con nombres de meses abreviados en español
  function formatoFechaEnEspanol(d) {
    const mes = mesesEnEspanol[d.getMonth()]; // Obtiene el nombre del mes en español
    const año = d.getFullYear(); // Obtiene el año
    return mes + " " + año.toString(); // Combina el mes y el año
  }
    
////////////    EJES  ////////////////////

  var ejeX = d3.axisBottom(xScale)
    .ticks(12)
    .tickFormat(formatoFechaEnEspanol); // Utiliza la función de formato personalizada

  svg
    .append("g")
    .attr("transform", "translate (0," + (height - margin.bottom) + ")")
    .call(ejeX)
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", function (d) {
      return "rotate(-45)";
    });
    // Agregar título al eje X
svg
    .append("text")
   .attr("x", width / 2)
   .attr("y", height- margin.bottom/4) // Ajusta la posición vertical según tus necesidades
   .attr("text-anchor", "middle")
   .text("Fecha");
    
    

 var gEjeY =  svg.append("g")
                .attr("transform","translate (" + margin.left + ",0)")
 
var ejeY = d3.axisLeft (yScale)
                .ticks(13);
    
gEjeY.transition ()
             .duration(1000)
             .ease(d3.easeBounce)
             .call(ejeY);
    
// Agregar título al eje Y
svg
    .append("text")
   .attr("transform", "rotate(-90)")
   .attr("x", 0 - height / 2)
   .attr("y", margin.left *0.5 ) // Ajusta la posición vertical según tus necesidades
   .attr("text-anchor", "middle")
   .text("Tasa de paro  (%)");
 
    
///////////////////////////////////////
function calcularValorMaximo() {
  let maxValor = 0; // Inicializamos en 0

    datos_tot.forEach((dato, posicion) => {
        const checkbox = document.querySelector(`.checkbox-${posicion}`);
        if (checkbox.checked) {
            // Si el checkbox está marcado, buscar el valor máximo en las líneas correspondientes
            const maxDato = d3.max(datos_tot[posicion].Data, (d) => d.Valor);
            if(maxDato>maxValor){//Actualiza el máximo global si es necesario
                maxValor=maxDato;
            }
        }    
    })
  return maxValor;
}
function actualizarLineas(datos, xScale, yScale, color) {
    svg.selectAll("line").remove();
    svg.selectAll("circle").remove();

    datos.forEach((dato, posicion) => {
        const checkbox = document.querySelector(`.checkbox-${posicion}`);
        svg.selectAll(`.texto-${posicion}`).remove();
        if (checkbox.checked) {
            mostrarLineas(dato, xScale, yScale, posicion);
        }
    });
        // Vuelve a crear y agregar el eje Y al SVG
   var ejeY = d3.axisLeft (yScale)
                .ticks(13);
     
        // Eje Y
        // Pinta sobre la misma g del eje Y
   gEjeY.transition ()
             .duration(1000)
             .ease(d3.easeBounce)
             .call(ejeY);
}
    
const colores = {}; // Objeto para almacenar los colores
    
function dibujarCheckbox(datos, posicion) {
    const color = colorScale(posicion); // Obtén un color único para este checkbox
    
    const variableNombre = datos.MetaData[2].Nombre;
    colores[variableNombre] = color; // Usa Variable.Nombre como claveclave
    
    console.log(`WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW COLOR: ${color}|VARIABLE NOMBRE: ${variableNombre}| COLORES: ${colores[variableNombre]}`);
    
    // Crea un checkbox
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = `checkbox-${posicion}`; // Agrega una clase específica
    checkbox.checked = false; // Por defecto, los checkboxes no están marcados
    
    // Escucha el evento "change" del checkbox
    checkbox.addEventListener("change", () => {
        const maximo = calcularValorMaximo();
        const yScale = d3
            .scaleLinear()
            .domain([0, maximo])
            .range([height - margin.bottom, 0 + margin.top]);
        
        // Llama a la función para mostrar u ocultar las líneas
        actualizarLineas(datos_tot, xScale, yScale, color);       
    });
     // Define la posición del botón en función de la posición
    checkbox.style.position = "absolute";
    checkbox.style.top = `${25 * posicion+ 40}px`; // Ajusta el espaciado vertical
    checkbox.style.left = width+20; // Ajusta la posición horizontal
   
    // Agrega el checkbox al documento
    document.body.appendChild(checkbox);

    // Crea una etiqueta para el checkbox (mostrar el nombre de la comunidad)
    const label = document.createElement("label");
    label.textContent = datos.MetaData.find(
      (meta) =>
        meta.Variable.Nombre === "Comunidades y Ciudades Autónomas" ||
        meta.Variable.Nombre === "Total Nacional"
    ).Nombre;

      
     // Define la posición del botón en función de la posición
     label.style.position = "absolute";
     label.style.top = `${25 * posicion+ 40}px`; // Ajusta el espaciado vertical
     label.style.left = width+50; // Ajusta la posición horizontal
     label.style.color= color; 
      
    // Agrega la etiqueta al documento
    document.body.appendChild(label);

  }

  // Pintamos
// Crea un elemento de tooltip
var tooltip = d3.select("body").append("div").attr("class", "tooltip");
    
    
    
    
function mostrarLineas(datos, escalaX, escalaY, posicion) {
  const color = colorScale(posicion);
  const circlesGroup=svg.append("g");  
  const lineasGroup = svg.append("g"); // Crea un grupo para las líneas
 const textoGroup = svg.append("g");
    

//DIBUJAMOS LINEAS
    
  const lineas = lineasGroup
    .selectAll("line")
    .data(datos.Data)
    .enter()
    .append("line")
    .attr("class", `lineas-${posicion}`)
    .attr("x1", (d, i) => escalaX(new Date(d.Fecha)))
    .attr("y1", (d, i) => escalaY(d.Valor))
    .attr("x2", (d, i) => {
      if (i < datos.Data.length - 1) {
        return escalaX(new Date(datos.Data[i + 1].Fecha));
      }
      return escalaX(new Date(d.Fecha));
    })
    .attr("y2", (d, i) => {
      if (i < datos.Data.length - 1) {
        return escalaY(datos.Data[i + 1].Valor);
      }
      return escalaY(d.Valor);
    })
    .attr("stroke", color)
    .attr("stroke-width", 3)
    .style("opacity", 0.3)
     

    
//DIBUJAMOS PUNTOS INVISIBLES MAS ANCHOS
  
    const circle_detect = circlesGroup
    .selectAll("circle")
    .data(datos.Data)
    .enter()
    .append("circle")
    .attr("class", `lineas-${posicion}`)
    .attr("cx", d => escalaX(new Date(d.Fecha)))
    .attr("cy", d => escalaY(d.Valor))
    .attr("r", 14)
    .attr("fill", color)
    .style("opacity", 0)
    
    

  // Agregar texto solo al último punto de la línea
    
  const texto = textoGroup
    .append("text")
    .attr("class", `texto-${posicion}`)
    .attr("x", escalaX(new Date(datos.Data[0].Fecha)))
    .attr("y", escalaY(datos.Data[0].Valor)) // Ajusta la posición vertical del texto
    .attr("dx", 10)
    .text(datos.MetaData.find(
      (meta) =>
        meta.Variable.Nombre === "Comunidades y Ciudades Autónomas" ||
        meta.Variable.Nombre === "Total Nacional"
    ).Nombre) // El texto que se mostrará
    .style("fill", color);
    
  // EVENTOS
   circle_detect
        .on("mouseover", function (d, i, nodes) {
      // Resaltar todas las líneas al pasar el cursor
      lineas.style("opacity", 1).attr("stroke-width", 3);

      // Crear y mostrar el círculo en el punto específico
    circle_Aux= svg
        .append("circle")
        .attr("r", 5)
        .attr("cx", escalaX(new Date(d.Fecha)))
        .attr("cy", escalaY(d.Valor))
        .attr("fill", color);
      
      pintarTooltip(d);
      
    })
    
    .on("click", function(d){
    	handleNodeClickBar(d)
    })
    
    .on("mouseout", function (d, i, nodes) {
      // Restaurar la opacidad de todas las líneas
      lineas.style("opacity", 0.3).attr("stroke-width", 3);

      // Eliminar el círculo al retirar el cursor
      circle_Aux.remove();
      borrarTooltip();
    });
   
  lineas
    .on("mouseover", function (d, i, nodes) {
      // Resaltar todas las líneas al pasar el cursor
      lineas.style("opacity", 1).attr("stroke-width", 3);
      
    })
    .on("mouseout", function (d, i, nodes) {
      // Restaurar la opacidad de todas las líneas
      lineas.style("opacity", 0.3).attr("stroke-width", 3);
   })
    
    
}

    
    /* Funciones para gestionar los Tooltips */
function borrarTooltip(){
         tooltip.style("display", "none");
    };
    
function pintarTooltip(d){
        tooltip.text(formatoFechaEnEspanol(new Date(d.Fecha))+": "+d.Valor+" %")
               .style ("top", d3.event.pageY + "px")
               .style ("left", d3.event.pageX + 5+ "px")
               // Para que la aparición no se brusca
               //.transition()
               .style("opacity",1)
               .style("display", "block");
        }
    
    function calcularMedia(datosFiltrados) {
        let sumaValores = 0;
        datosFiltrados.forEach(item => {
            sumaValores += item.Valor;
        });
        const media = sumaValores / datosFiltrados.length;
        return media;
    }            
    
    function filtrarPorAnio(datos, Anio, trimestre) {
        console.log("filtrarDatosPorAño ----------> ---------------------------------------------------------------------------------- STEP 0");
        const subconj = [];
        datos.forEach(function (d) {
            const tieneAnio = d.Data.some(item => item.Anyo === Anio);
            const tieneCCAA = d.MetaData.some(item => item.Variable.Nombre === "Comunidades y Ciudades Autónomas" && item.Variable.Codigo === "CCAA");
            const tieneTasaParo = d.Nombre.includes("Tasa de paro de la población. Ambos sexos.") && d.Nombre.includes("Todas las edades.");
            const tieneTrimestre = d.Data.some(item => item.T3_Periodo === trimestre);

            if (tieneCCAA && tieneTasaParo && tieneAnio && tieneTrimestre) {
                const subconjData = d.Data.filter(item => {
                    const itemAnio = new Date(item.Fecha).getFullYear();
                    return itemAnio === Anio;
                });

                if (subconjData.length > 0) {
                    const datosFiltrados = {
                        COD: d.COD,
                        Nombre: d.Nombre,
                        T3_Unidad: d.T3_Unidad,
                        T3_Escala: d.T3_Escala,
                        MetaData: d.MetaData,
                        Data: [{
                            Fecha: subconjData[0].Fecha,
                            T3_TipoDato: subconjData[0].T3_TipoDato,
                            T3_Periodo: subconjData[0].T3_Periodo,
                            Anyo: Anio,
                            Valor: subconjData[0].Valor
                        }]
                    };
                    subconj.push(datosFiltrados);
                }
            }
        });

        console.log("filtrarDatosPorAño ----------> ---------------------------------------------------------------------------------- STEP 1");
        return subconj;
    }                                        


    // Función para manejar el clic en un nodo de la gráfica de líneas
    function handleNodeClickBar(d) {
        console.log("handleNodeClick ----------> ---------------------------------------------------------------------------------- STEP 0"); 
        
        // Obtiene el año del nodo clicado
        const añoSeleccionado = new Date(d.Fecha).getFullYear();
        
        const trimestreSeleccionado = d.T3_Periodo
        
        console.log("    handleNodeClick ----------> Año Seleccionado:", añoSeleccionado); // Mostrar el valor de añoSeleccionado en la consola
        
        console.log(`    handleNodeClick ----------> Año Seleccionado: ${añoSeleccionado} - Trimestre: ${trimestreSeleccionado}`);

        
        console.log("handleNodeClick ----------> ---------------------------------------------------------------------------------- STEP 1"); 
        
        // Filtra los datos de barras según el año seleccionado
        const datosBarras = filtrarPorAnio(datosCompletos, añoSeleccionado, trimestreSeleccionado);
        
        console.log("handleNodeClick ----------> ---------------------------------------------------------------------------------- STEP 2"); 
        
        console.log(datosBarras); // Imprime los datos filtrados en la consola
        
        
        console.log("handleNodeClick ----------> ---------------------------------------------------------------------------------- STEP 3"); 

        // Muestra las barras correspondientes al año seleccionado
        crearGraficoBarras(datosBarras);
        
        console.log("handleNodeClick ----------> ---------------------------------------------------------------------------------- STEP 4"); 
    }
    
    
    
    
    function crearGraficoBarras(datos) {
        
        // Eliminar la gráfica de barras anterior por su id si existe
        d3.select("#grafico-barras").remove();
        
        const ancho = 800;
        const alto = 500;
        const margen = { superior: 80, derecho: 30, inferior: 170, izquierdo: 80 }; // Ajusta el margen inferior para evitar cortes

        const svg = d3.select("body").append("svg")
             .attr("id", "grafico-barras")  // Asigna un id único al elemento SVG de la gráfica de barras
            .attr("width", ancho + margen.izquierdo + margen.derecho)
            .attr("height", alto + margen.superior + margen.inferior)
            .append("g")
            .attr("transform", "translate(" + margen.izquierdo + "," + margen.superior + ")");

        const datosOrganizados = datos.map(dato => {
            const comunidadAutonoma = dato.MetaData.find(item => item.Variable.Nombre === "Comunidades y Ciudades Autónomas").Nombre;
            const valor = parseFloat(dato.Data[0].Valor);
            console.log(`Comunidad Autónoma: ${comunidadAutonoma}, Valor: ${valor}, Tipo: ${typeof valor}`);

            return {
                comunidadAutonoma: comunidadAutonoma,
                valor: valor
            };
        });
        
        const escalaX = d3.scaleBand()
            .domain(datosOrganizados.map(d => d.comunidadAutonoma))
            .range([0, ancho])
            .padding(0.1);

        const escalaY = d3.scaleLinear()
            .domain([0, d3.max(datosOrganizados, d => d.valor)])
            .nice()
            .range([alto, 0]);
        
        svg.selectAll(".barra")
            .data(datosOrganizados)
            .enter().append("rect")
            .attr("class", "barra")
            .attr("x", d => escalaX(d.comunidadAutonoma))
            .attr("width", escalaX.bandwidth())
            .attr("y", d => alto) // Inicialmente, las barras comienzan desde la parte inferior del gráfico
            .attr("height", 0) // Inicialmente, las barras tienen altura cero
            .attr("fill",d => colores[d.comunidadAutonoma])
            .transition() // Inicia la transición
            .delay((d, i) => i * 120) // Añade un retraso creciente para cada barra
            .duration(400) // Duración de la transición en milisegundos
            .ease (d3.easeElastic.period(6)) // Velocidad de rebote
            .attr("y", d => escalaY(d.valor)) // Actualiza la posición Y de las barras durante la transición
            .attr("height", d => alto - escalaY(d.valor)); // Actualiza la altura de las barras durante la transición


        svg.append("g")
            .attr("class", "ejeX")
            .call(d3.axisBottom(escalaX))
            .attr("transform", "translate(0," + alto + ")")
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)")
            .style("font-size", "12px"); // Ajusta el tamaño de la fuente
        
        // Añadir título al gráfico
        const titulo = "Paro del trimestre " +datos[0].Data[0].T3_Periodo+ " por CCAA " + datos[0].Data[0].Anyo;
        svg.append("text")
            .attr("x", ancho / 2) // Posición X en el centro del SVG
            .attr("y", -margen.superior / 2) // Posición Y arriba del gráfico
            .attr("text-anchor", "middle") // Alineación del texto al centro
            .style("font-size", "18px") // Tamaño de la fuente
            .text(titulo); // Texto del título

        svg.append("g")
            .attr("class", "ejeY")
            .call(d3.axisLeft(escalaY));
    }

  // Itera a través de tus datos y dibuja checkboxes para cada conjunto de datos
  datos_tot.forEach((datos, i) => {
    dibujarCheckbox(datos, i);
  });
});
