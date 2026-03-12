// server.js - Servidor web simple
const http = require('http');
const fs = require('fs');
const path = require('path');
const { fetchCalienteHtml, extraerDatos, convertirACSV } = require('./api');

const PORT = process.env.PORT || 3000;

const server = http.createServer(async (req, res) => {
    console.log(`${req.method} ${req.url}`);
    
    // Configurar CORS para permitir acceso desde Google Sheets
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    try {
        // Ruta principal: HTML
        if (req.url === '/' || req.url === '/index.html') {
            const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(html);
            return;
        }
        
        // API JSON
        if (req.url === '/json') {
            const html = await fetchCalienteHtml();
            const data = extraerDatos(html);
            
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({
                success: true,
                data: data,
                timestamp: new Date().toISOString()
            }));
            return;
        }
        
        // API CSV (RECOMENDADO para Google Sheets)
        if (req.url === '/csv') {
            const html = await fetchCalienteHtml();
            const data = extraerDatos(html);
            const csv = convertirACSV(data);
            
            res.writeHead(200, { 
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': 'attachment; filename="caliente.csv"'
            });
            res.end(csv);
            return;
        }
        
        // Ruta no encontrada
        res.writeHead(404);
        res.end('404 Not Found');
        
    } catch (error) {
        console.error('Error:', error);
        res.writeHead(500);
        res.end(JSON.stringify({ error: error.toString() }));
    }
});

server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
