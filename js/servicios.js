// js/servicios.js

// Exportamos la función para poder usarla en otros archivos
export const obtenerProductos = async () => {
    try {
        // La ruta sigue siendo relativa al index o catalogo.html
        const response = await fetch("../json/data.json");
        
        if (!response.ok) {
            throw new Error("No se pudo cargar el JSON de productos");
        }
        
        // Retornamos los datos "limpios"
        const data = await response.json();
        return data;
        
    } catch (error) {
        // Relanzamos el error para que lo maneje el main.js (quien muestra la alerta)
        throw error;
    }
};