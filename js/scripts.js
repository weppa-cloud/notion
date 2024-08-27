require('dotenv').config();

let productos = []; // Variable global para almacenar los productos
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

// Escuchar eventos del objeto Window
window.addEventListener("message", function (event) {
    console.log('Received event data:', event.data);

    if (!isJSONValid(event.data)) {
        console.error('Invalid JSON:', event.data);
        return;
    }

    // Procesar los datos del evento
    eventData = JSON.parse(event.data);

    // Mostrar mensaje de carga
    // document.getElementById('loading').style.display = 'flex';
    // document.getElementById('resumen').style.display = 'none';



    // Enviar los datos a n8n y esperar la respuesta
    fetch('https://n8n.weppa.co/webhook/notion', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData)
    })
    .then(response => response.json())
    .then(n8nResponse => {
        console.log('Received response from n8n:', n8nResponse);

        // Verifica si el campo result contiene el array de objetos
        productos = n8nResponse || [];
        mostrarProductos(productos); // Mostrar todos los productos inicialmente
        
        

        // Aquí puedes procesar la respuesta de n8n y modificar los datos si es necesario
        // const chatwootData = {
        //     ...eventData, 
        //     reply: n8nResponse.reply || ''
        // };
    })
    .catch((error) => {
        console.error('Error sending data to n8n:', error);
        document.getElementById('loading').style.display = 'none';
    });

    
});




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
            const price = producto.property_tarifa_en_doble || '';
            // const imageBase64 = producto.image_128;
            const imageUrl = producto.property_url_foto_destacada || '/assets/images/default_image.png';
            const destino = producto.property_destino.join(', ') || '';
            const tipo_actividad = producto.property_tipo.join(', ') || '';
            
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


function enviarProducto(idProducto) {
    // Obtener el producto correspondiente  
    const productoSeleccionado = productos.find(producto => producto.id === idProducto);
    console.log(productoSeleccionado);
    

    if (!productoSeleccionado) {
        console.error('Producto no encontrado');
        return;
    }
    
    console.log("Id conversacion: " + eventData.data.conversation.id);
    const id_conversacion = eventData.data.conversation.id;
    // const id_conversacion = '19666';
    

    // Aquí puedes agregar la información que llega con el evento inicial
    const data = {
        
        // ...productoSeleccionado,
        // Agregar cualquier otra información necesaria
        "content": `
            *${productoSeleccionado.name}*
            \n${productoSeleccionado.property_descripci_n}
            \nPrecio: ${productoSeleccionado.property_tarifa_en_doble} US$
            \nTipo: ${productoSeleccionado.property_tipo.join(', ')}
            \nDestino: ${productoSeleccionado.property_destino.join(', ')}`,
        "message_type": "outgoing"
    };

    // Realizar la solicitud POST
    fetch(`https://web.chatia.app/api/v1/accounts/11/conversations/${id_conversacion}/messages`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'api_access_token': process.env.API_ACCESS_TOKEN
            
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(responseData => {
        console.log('Producto enviado con éxito:', responseData);
        // Aquí puedes manejar la respuesta de tu servidor
    })
    .catch(error => {
        console.error('Error al enviar el producto:', error);
    });
}
