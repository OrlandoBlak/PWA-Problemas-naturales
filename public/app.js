import { listaEjercicios } from './api/exercises.js';

document.addEventListener('DOMContentLoaded', () => {
    // Referencias a los elementos del HTML
    const btnGenerate = document.getElementById('btn-generate');
    const btnCheck = document.getElementById('btn-check');
    const userInput = document.getElementById('user-input');
    const answerArea = document.getElementById('answer-area');
    const problemDisplay = document.querySelector('.math-problem');
    const resultArea = document.getElementById('result-area');
    const scoreDisplay = document.getElementById('solved-count');

    let ejercicioActual = null;

    // 1. Cargar el progreso guardado (Cache/LocalStorage)
    function cargarProgreso() {
        const guardados = JSON.parse(localStorage.getItem('ejercicios_resueltos')) || [];
        scoreDisplay.textContent = guardados.length;
        return guardados; // Retorna la lista de IDs que ya resolvió
    }

    // Inicializamos el contador al abrir la app
    cargarProgreso();

    // 2. Función para cargar ejercicio
    function cargarNuevoEjercicio() {
        // Limpiamos pantalla anterior
        resultArea.classList.add('hidden');
        resultArea.textContent = '';
        userInput.value = '';
        answerArea.classList.remove('hidden');
        
        // Elegir uno al azar
        const indice = Math.floor(Math.random() * listaEjercicios.length);
        ejercicioActual = listaEjercicios[indice];
        
        problemDisplay.textContent = ejercicioActual.text;
        
        // Enfocar en el cuadro para escribir rápido
        userInput.focus();
    }

    // 3. Función para verificar respuesta
    function verificarRespuesta() {
        if (!ejercicioActual) return;

        const respuestaUsuario = parseInt(userInput.value);
        
        if (isNaN(respuestaUsuario)) {
            resultArea.textContent = "⚠️ Escribe un número primero";
            resultArea.style.color = "orange";
            resultArea.classList.remove('hidden');
            return;
        }

        if (respuestaUsuario === ejercicioActual.result) {
            // -- CORRECTO --
            resultArea.textContent = " ¡Correcto! Muy bien.";
            resultArea.style.color = "#27ae60";
            
            // Guardar en Cache/Storage
            guardarEnMemoria(ejercicioActual.id);

            // --- NUEVO: LANZAR NOTIFICACIÓN ---
            lanzarNotificacion();  // 
            // ----------------------------------
            
            // Ocultar botón de verificar para obligar a pedir otro
            answerArea.classList.add('hidden');

        } else {
            // -- INCORRECTO --
            resultArea.textContent = " Inténtalo de nuevo.";
            resultArea.style.color = "#c0392b";
        }
        resultArea.classList.remove('hidden');
    }

    // 4. Guardar en LocalStorage (Nuestra "Cache" de datos)
    function guardarEnMemoria(id) {
        let guardados = cargarProgreso(); // Leemos lo que ya hay
        
        // Si no hemos guardado este ID antes, lo agregamos
        if (!guardados.includes(id)) {
            guardados.push(id);
            localStorage.setItem('ejercicios_resueltos', JSON.stringify(guardados));
            
            // Actualizamos el numerito en pantalla
            scoreDisplay.textContent = guardados.length;
        }
    }

    // Eventos (Clicks)
    btnGenerate.addEventListener('click', cargarNuevoEjercicio);
    btnCheck.addEventListener('click', verificarRespuesta);
    
    // Permitir dar ENTER para verificar
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') verificarRespuesta();
    });
});

// Service Worker (Se mantiene igual)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('SW listo', reg.scope))
            .catch(err => console.log('SW fallo', err));
    });
}
// --- LÓGICA DE LA CÁMARA ---
    const btnCamera = document.getElementById('btn-camera');
    const videoFeed = document.getElementById('video-feed');
    let localStream = null; // Aquí guardaremos la señal de video

    btnCamera.addEventListener('click', async () => {
        // Si la cámara ya está encendida, la APAGAMOS
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            localStream = null;
            videoFeed.classList.add('hidden');
            btnCamera.textContent = "Abrir Cámara";
            btnCamera.classList.remove('camera-active');
            return;
        }

        // Si está apagada, la ENCENDEMOS (Pide permiso aquí)
        try {
            // Esta línea lanza la notificación de permiso automáticamente
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: "environment" } // Intenta usar la cámara trasera
            });

            // Si el usuario da permiso, pasamos aquí:
            localStream = stream;
            videoFeed.srcObject = stream;
            videoFeed.classList.remove('hidden');
            
            // Cambiamos el botón a "Cerrar"
            btnCamera.textContent = "Cerrar Cámara";
            btnCamera.classList.add('camera-active');

        } catch (error) {
            // Si el usuario bloquea el permiso o no hay cámara
            console.error("Error al acceder a la cámara:", error);
            alert(" No pudimos acceder a la cámara. Asegúrate de dar permiso.");
        }
    });
// --- LÓGICA DE NOTIFICACIONES ---
    const btnNotify = document.getElementById('btn-notify');

    // 1. Pedir permiso al usuario
    btnNotify.addEventListener('click', () => {
        if (!("Notification" in window)) {
            alert("Tu navegador no soporta notificaciones");
            return;
        }

        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                btnNotify.textContent = "🔔 Notificaciones Activadas";
                btnNotify.style.backgroundColor = "#27ae60"; // Verde
                new Notification("¡Genial!", {
                    body: "Ahora te avisaremos cuando aciertes.",
                    icon: "./icons/icon-192.png"
                });
            }
        });
    });

    // 2. Función para lanzar notificación (La usaremos al acertar)
    function lanzarNotificacion() {
        if (Notification.permission === "granted") {
            // Vibración del celular (Elemento físico extra)
            if (navigator.vibrate) navigator.vibrate([200, 100, 200]); 
            
            new Notification("¡Excelente Trabajo! 🎉", {
                body: "Has resuelto el ejercicio correctamente.",
                icon: "./icons/icon-192.png"
            });
        }
    }