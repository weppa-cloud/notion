// require('dotenv').config();

let productos = []; // Variable global para almacenar los productos
let hoteles = [];
let eventData ={};

// Función para validar si el JSON es correcto
function isJSONValid(str) {
    try {
        JSON.parse(str);
        return true;
    } catch (e) {
        return false;
    }
}
console.log("Antes del evento");

// Escuchar eventos del objeto Window
window.addEventListener("message", function (event) {
    if (!isJSONValid(event.data)) {
        console.error('Invalid JSON:', event.data);
        return;
    }

    console.log("Data recibida", eventData);
    
    // Procesar los datos del evento
    eventData = JSON.parse(event.data);
    cargarActividades();


});

// Función para cargar las actividades (por defecto)
function cargarActividades() {

    document.getElementById('titulo-productos').innerText = 'Actividades';
    document.getElementById('loading').style.display = 'block';

    if(productos == '') {
        

        // Enviar los datos a n8n y esperar la respuesta de las actividades
        fetch('https://n8n.weppa.co/webhook/notion-actividades', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(eventData)
        })
        .then(response => response.json())
        .then(n8nResponse => {
            console.log("Data de n8n: ", n8nResponse);
            productos = n8nResponse || [];
            console.log("Productos recibidos: ", productos);
            mostrarProductos(productos);
        })
        .catch((error) => {
            document.getElementById('loading').style.display = 'none';
        });
    }
    console.log("Producots cargados: ", productos);
    
    mostrarProductos(productos);
}


// Función para cargar los hoteles
function cargarHoteles() {
    console.log("Cargando hoteles");
    
    document.getElementById('titulo-productos').innerText = 'Hoteles';
    document.getElementById('loading').style.display = 'block';

    if (hoteles == '') {

        let html = '';
        html += '<p>Aqui van los hoteles</p>';
    
        // Enviar los datos a otra URL que devuelva hoteles
        fetch('https://n8n.weppa.co/webhook/notion-hoteles', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(eventData) // Puedes ajustar esto según lo que necesite la API de hoteles
        })
        .then(response => response.json())
        .then(hotelesResponse => {
            hoteles = hotelesResponse || [];
            console.log("Hoteles carghados", hoteles);
            
            mostrarHoteles(hoteles);
        })
        .catch((error) => {
            document.getElementById('loading').style.display = 'none';
        });
    }

    mostrarHoteles(hoteles);

}



// Función para mostrar los productos
function mostrarProductos(productos) {
    let html = '';

    // Si productos no es un array, conviértelo en un array
    if (!Array.isArray(productos)) {
        productos = [productos];
    }

    if (productos.length === 0) {
        html += '<p>No hay resultados para la búsquedaaa.</p>';
    } else {
        productos.forEach(producto => {
            const name = producto.name || 'Sin título';
            const description = producto.property_descripci_n || 'Sin descripción';
            const imageUrl = producto.property_url_foto_destacada || '/assets/images/default_image.png';
            const destino = producto.property_destino?.join(', ') || '-';
            const price = producto.property_tarifa_en_doble || '';
            const tipo_actividad = producto.property_tipo.join(', ') || '-';
            
            const id = producto.id;

            
            html += `
                <div class="card">
                    <div class="card-text">
                        <h2>${name}</h2>
                        <p class="description">${description}</p>
                        <p>Destino: ${destino}</p>
                        <p>Tipo: ${tipo_actividad}</p>
                        <div class="price">${price} US$</div>
                        <button onclick="enviarProducto('${id}')">Enviar</button>
                    </div>
                    <div class="card-image">
                        <img src=   "${imageUrl}" alt="${name}">
                    </div>
                </div>
            `;
        });
    }

    document.getElementById('resumen').innerHTML = html;
    document.getElementById('loading').style.display = 'none';
    document.getElementById('resumen').style.display = 'flex';
    
}


// Función para mostrar los productos
function mostrarHoteles(hoteles) {
    let html = '';

    // Si hoteles no es un array, conviértelo en un array
    if (!Array.isArray(hoteles)) {
        hoteles = [hoteles];
    }

    if (hoteles.length === 0) {
        html += '<p>No hay resultados para la búsquedaaa.</p>';
    } else {
        hoteles.forEach(producto => {
            const name = producto.name || 'Sin título';
            // const description = producto.property_descripci_n || 'Sin descripción';
            const imageUrl = producto.property_fotos[0] || '/assets/images/default_image.png';
            const destino = producto.property_ || '-';
            // const price = producto.property_tarifa_en_doble || '';
            // const tipo_actividad = producto.property_tipo.join(', ') || '-';
            
            const id = producto.id;

            
            html += `
                <div class="card">
                    <div class="card-text">
                        <h2>${name}</h2>
        
                        <p>Destino: ${destino}</p>
                        
                        
                        <button onclick="enviarProducto('${id}')">Enviar</button>
                    </div>
                    <div class="card-image">
                        <img src=   "${imageUrl}" alt="${name}">
                    </div>
                </div>
            `;
        });
    }

    document.getElementById('resumen').innerHTML = html;
    document.getElementById('loading').style.display = 'none';
    document.getElementById('resumen').style.display = 'flex';
    
}

// Función para filtrar los productos por nombre
function filterProducts() {
    const query = document.getElementById('search').value.toLowerCase();
    const filteredProducts = productos.filter(producto => 
        producto.name.toLowerCase().includes(query)
    );

    mostrarProductos(filteredProducts); // Mostrar los productos filtrados
}

// Añadir event listener al cuadro de búsqueda
document.getElementById('search').addEventListener('input', filterProducts);



// Función para mostrar el modal
function mostrarModal(mensaje) {
    const modal = document.getElementById("resultadoModal");
    const mensajeModal = document.getElementById("mensajeModal");
    mensajeModal.textContent = mensaje;
    modal.style.display = "block";
}

// Cerrar el modal al hacer clic en la "X"
const span = document.getElementsByClassName("close")[0];
span.onclick = function() {
    document.getElementById("resultadoModal").style.display = "none";
}

// Cerrar el modal si el usuario hace clic fuera de él
window.onclick = function(event) {
    const modal = document.getElementById("resultadoModal");
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

async function enviarProducto(idProducto) {
    // Obtener el producto correspondiente  
    const productoSeleccionado = productos.find(producto => producto.id === idProducto);

    if (!productoSeleccionado) {
        mostrarModal('Error al enviar el producto - Producto seleccionado no existe');
        return;
    }
    
    // const id_conversacion = eventData.data.conversation.id;
    const id_conversacion = '19666';
    const urlImagen = productoSeleccionado.property_url_foto_destacada || '../assets/images/default_image.png'; // Asegúrate de que este campo tenga la URL correcta


    console.log("Antes del try");
    
    try {
        console.log("Entró al try");
        //Obtener la imagen como Blob
        const responseImagen = await fetch(urlImagen);

        if (!responseImagen.ok) {
            mostrarModal('Error al obtener el producto en responseImagen');
            throw new Error('Error al obtener el producto en responseImagen');
        }

        console.log("Despues del fetch urlImagen");
        

        const blob = await responseImagen.blob();
        // const blob = productoSeleccionado.property_url_foto_destacada;

        //Crear un FormData y agregar el archivo Blob
        const formData = new FormData();
        formData.append('attachments[]', blob, 'imagen.jpg'); // Puedes ajustar el nombre del archivo según sea necesario

        // Agregar el contenido del mensaje
        formData.append('content', `
            *${productoSeleccionado.name}*
            \n${productoSeleccionado.property_descripci_n || 'Sin descripción'}
            \nTipo: ${productoSeleccionado.property_tipo.join(', ') || '-'}
            \nDestino: ${productoSeleccionado.property_destino?.join(', ') || '-'}`);

        console.log("Antes de el fetch a chatia");
        

        //Enviar la solicitud POST
        const responsePost = await fetch(`https://web.chatia.app/api/v1/accounts/11/conversations/${id_conversacion}/messages`, {
            method: 'POST',
            headers: {
                'api_access_token': 'Zpzr1UXYh3CE6eah4ZGYyc86'
            },
            body: formData
        });

        console.log("despues de el fetch a chatia");
        
        const responseData = await responsePost.json();
        mostrarModal('Producto enviado con éxito');

    } catch (error) {
        console.log("Error general", error);
        
        mostrarModal('Error al enviar el producto General');
    }
}
