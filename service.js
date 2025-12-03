const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'view'));

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Ruta Servidor (EJS)
app.get('/server', (req, res) => {
    res.render('server-view', {
        pageTitle: 'Mates 6º | Vista Servidor',
        headerTitle: ' Matemáticas EJS',
        serverDate: new Date().toLocaleDateString(),
        message: '¡Hola! Esta vista fue generada por el servidor.'
    });
});

// Ruta Principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'splash.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor PWA corriendo en: http://localhost:${PORT}`);
});