// api.js - Lógica de procesamiento del HTML
const https = require('https');

async function fetchCalienteHtml() {
    return new Promise((resolve, reject) => {
        https.get('https://bet.caliente.mx/es_MX/Basquetbol', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

function extraerDatos(html) {
    const resultado = [];
    
    // Limpiar HTML básico
    html = html.replace(/<script[\s\S]*?<\/script>/gi, '')
               .replace(/<style[\s\S]*?<\/style>/gi, '')
               .replace(/&nbsp;/g, ' ');
    
    // Cabecera
    resultado.push(['📊 CALIENTE - BÁSQUETBOL']);
    resultado.push(['Actualizado:', new Date().toLocaleString('es-MX', {timeZone: 'America/Mexico_City'})]);
    resultado.push([]);
    
    // EVENTOS PRÓXIMOS
    resultado.push(['⏳ EVENTOS NBA PRÓXIMOS']);
    resultado.push(['Hora', 'Equipo Local', 'Equipo Visitante', 'Momio Local', 'Momio Visitante']);
    
    // Expresión regular mejorada para encontrar eventos
    const eventoRegex = /<div[^>]*class="[^"]*ev-seln[^"]*"[^>]*data-ev_id="[^"]*"[^>]*>[\s\S]*?<span class="time"[^>]*>([^<]+)<[\s\S]*?<span class="team-name"[^>]*>([^<]+)<[\s\S]*?<span class="team-name"[^>]*>([^<]+)<[\s\S]*?<span class="price dec"[^>]*>([^<]+)<[\s\S]*?<span class="price dec"[^>]*>([^<]+)<\/span>/g;
    
    let match;
    let count = 0;
    while ((match = eventoRegex.exec(html)) !== null && count < 20) {
        resultado.push([
            match[1].trim(),
            match[2].trim(),
            match[3].trim(),
            match[4].trim(),
            match[5].trim()
        ]);
        count++;
    }
    
    if (count === 0) {
        resultado.push(['No se encontraron eventos próximos']);
    }
    resultado.push([]);
    
    // TOP BETS
    resultado.push(['🎲 TOP BETS (PARLAY)']);
    resultado.push(['Evento', 'Selección', 'Momio Decimal']);
    
    const topRegex = /<li[^>]*>[\s\S]*?<span class="ev-name"[^>]*>([^<]+)<[\s\S]*?<span class="seln-name"[^>]*>([^<]+)<[\s\S]*?<span class="price dec"[^>]*>([^<]+)<\/span>/g;
    count = 0;
    while ((match = topRegex.exec(html)) !== null && count < 10) {
        resultado.push([
            match[1].trim(),
            match[2].trim(),
            match[3].trim()
        ]);
        count++;
    }
    
    if (count === 0) {
        resultado.push(['No se encontraron top bets']);
    }
    
    return resultado;
}

function convertirACSV(data) {
    return data.map(row => 
        row.map(cell => {
            if (cell === null || cell === undefined) return '';
            if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))) {
                return `"${cell.replace(/"/g, '""')}"`;
            }
            return cell;
        }).join(',')
    ).join('\n');
}

// Exportar para uso en servidor
module.exports = { fetchCalienteHtml, extraerDatos, convertirACSV };
