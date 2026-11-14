const CONFIG_URL =
    "https://gist.githubusercontent.com/lezaproduccionescine-hash/63a485bfecd6885e460cfca93b516285/raw/leza-tv-config.json";


const liveBadge =
    document.getElementById("liveBadge");

const video =
    document.getElementById("video");

const status =
    document.getElementById("status");


let hls = null;

let reproduciendo = false;

let comprobando = false;

let apiBaseUrl = null;

let streamBaseUrl = null;

let espectadorRegistrado = false;

const viewerId = crypto.randomUUID();

let heartbeat = null;


/* =========================================================
   OBTENER CONFIGURACIÓN
========================================================= */

async function obtenerConfiguracion() {

    const respuesta = await fetch(
        CONFIG_URL + "?t=" + Date.now(),
        {
            cache: "no-store"
        }
    );


    if (!respuesta.ok) {

        throw new Error(
            `Error obteniendo configuración: HTTP ${respuesta.status}`
        );

    }


    const configuracion =
        await respuesta.json();


    if (
        !configuracion.api ||
        !configuracion.stream
    ) {

        throw new Error(
            "La configuración no contiene api y stream"
        );

    }


    apiBaseUrl =
        configuracion.api.replace(/\/$/, "");

    streamBaseUrl =
        configuracion.stream.replace(/\/$/, "");


    console.log(
        "API configurada:",
        apiBaseUrl
    );

    console.log(
        "Stream configurado:",
        streamBaseUrl
    );

}


/* =========================================================
   REGISTRAR ESPECTADOR
========================================================= */

async function registrarEspectador() {

    if (
        espectadorRegistrado ||
        !apiBaseUrl
    ) {

        return;

    }


    try {

        const respuesta = await fetch(
            `${apiBaseUrl}/api/viewer/connect`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    id: viewerId
                })
            }
        );


        if (!respuesta.ok) {

            throw new Error(
                `Error registrando espectador: HTTP ${respuesta.status}`
            );

        }


        espectadorRegistrado = true;


        console.log(
            "Espectador registrado:",
            viewerId
        );


        await enviarHeartbeat();


        clearInterval(heartbeat);


        heartbeat = setInterval(
            enviarHeartbeat,
            30000
        );

    }
    catch (error) {

        console.error(
            "Error registrando espectador:",
            error
        );

    }

}


/* =========================================================
   HEARTBEAT DEL ESPECTADOR
========================================================= */

async function enviarHeartbeat() {

    if (
        !espectadorRegistrado ||
        !apiBaseUrl
    ) {

        return;

    }


    try {

        const respuesta = await fetch(
            `${apiBaseUrl}/api/viewer/heartbeat`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    id: viewerId
                })
            }
        );


        if (!respuesta.ok) {

            throw new Error(
                `Heartbeat HTTP ${respuesta.status}`
            );

        }

    }
    catch (error) {

        console.error(
            "Error enviando heartbeat:",
            error
        );

    }

}


/* =========================================================
   DESCONECTAR ESPECTADOR
========================================================= */

function desconectarEspectador() {

    if (
        !espectadorRegistrado ||
        !apiBaseUrl
    ) {

        return;

    }


    clearInterval(heartbeat);


    navigator.sendBeacon(

        `${apiBaseUrl}/api/viewer/disconnect`,

        new Blob(
            [
                JSON.stringify({
                    id: viewerId
                })
            ],

            {
                type: "application/json"
            }
        )

    );


    espectadorRegistrado = false;


    console.log(
        "Espectador desconectado"
    );

}


/* =========================================================
   DETENER REPRODUCTOR
========================================================= */

function detenerReproductor() {

    console.log(
        "Deteniendo reproductor..."
    );


    if (hls) {

        hls.destroy();

        hls = null;

    }


    video.pause();

    video.removeAttribute("src");

    video.load();


    reproduciendo = false;


    liveBadge.classList.add(
        "hidden"
    );


    status.classList.remove(
        "hidden"
    );


    status.textContent =
        "Esperando transmisión...";


    desconectarEspectador();

}


/* =========================================================
   CARGAR TRANSMISIÓN

   RECIBE DIRECTAMENTE LA URL HLS QUE DEVUELVE LA API.
========================================================= */

function cargarTransmision(hlsUrl) {

    if (reproduciendo) {

        return;

    }


    if (!hlsUrl) {

        console.error(
            "No se recibió una URL HLS."
        );

        return;

    }


    console.log(
        "Reproduciendo:",
        hlsUrl
    );


    status.classList.remove(
        "hidden"
    );


    status.textContent =
        "Cargando transmisión...";


    /*
        LIMPIAR REPRODUCTOR ANTERIOR
    */

    if (hls) {

        hls.destroy();

        hls = null;

    }


    /*
        HLS.JS NO CARGADO
    */

    if (typeof Hls === "undefined") {

        console.error(
            "Hls.js no está cargado."
        );


        status.textContent =
            "Error: HLS no está disponible";

        return;

    }


    /*
        NAVEGADOR CON SOPORTE NATIVO HLS
    */

    if (!Hls.isSupported()) {

        if (
            video.canPlayType(
                "application/vnd.apple.mpegurl"
            )
        ) {

            video.src = hlsUrl;


            video.play()
                .then(async () => {

                    reproduciendo = true;


                    liveBadge.classList.remove(
                        "hidden"
                    );


                    status.classList.add(
                        "hidden"
                    );


                    await registrarEspectador();

                })
                .catch(error => {

                    console.warn(
                        "La reproducción requiere interacción:",
                        error
                    );

                });

        }
        else {

            status.textContent =
                "Tu navegador no soporta HLS";

        }


        return;

    }


    /*
        INICIAR HLS.JS
    */

    reproduciendo = true;


    hls = new Hls({

        enableWorker: true,

        lowLatencyMode: true,

        backBufferLength: 90

    });


    hls.attachMedia(video);


    /*
        CUANDO EL VIDEO ESTÁ CONECTADO
    */

    hls.on(
        Hls.Events.MEDIA_ATTACHED,
        () => {

            console.log(
                "MEDIA ATTACHED"
            );


            hls.loadSource(
                hlsUrl
            );

        }
    );


    /*
        MANIFEST CARGADO
    */

    hls.on(
        Hls.Events.MANIFEST_PARSED,
        async () => {

            console.log(
                "MANIFEST PARSED"
            );


            liveBadge.classList.remove(
                "hidden"
            );


            status.classList.add(
                "hidden"
            );


            /*
                REGISTRAR ESPECTADOR
            */

            await registrarEspectador();


            /*
                INTENTAR REPRODUCCIÓN AUTOMÁTICA
            */

            try {

                await video.play();

            }
            catch (error) {

                console.warn(
                    "La reproducción requiere interacción:",
                    error
                );

            }

        }
    );


    /*
        VIDEO COMENZÓ A REPRODUCIRSE
    */

    video.onplaying = async () => {

        console.log(
            "Video reproduciendo"
        );


        status.classList.add(
            "hidden"
        );


        liveBadge.classList.remove(
            "hidden"
        );


        await registrarEspectador();

    };


    /*
        ERROR NATIVO DEL VIDEO
    */

    video.onerror = () => {

        console.error(
            "Error del video:",
            video.error
        );

    };


    /*
        ERRORES DE HLS.JS
    */

    hls.on(
        Hls.Events.ERROR,
        (event, data) => {

            console.error(
                "=============================="
            );

            console.error(
                "ERROR HLS"
            );

            console.error(
                "Tipo:",
                data.type
            );

            console.error(
                "Detalles:",
                data.details
            );

            console.error(
                "Fatal:",
                data.fatal
            );

            console.error(
                "Respuesta:",
                data.response
            );

            console.error(
                "URL:",
                hlsUrl
            );

            console.error(
                "Objeto completo:",
                data
            );

            console.error(
                "=============================="
            );


            /*
                SOLO DETENER SI EL ERROR ES FATAL
            */

            if (data.fatal) {

                switch (data.type) {

                    case Hls.ErrorTypes.NETWORK_ERROR:

                        console.warn(
                            "Error de red. Intentando recuperar..."
                        );


                        hls.startLoad();

                        break;


                    case Hls.ErrorTypes.MEDIA_ERROR:

                        console.warn(
                            "Error de reproducción. Intentando recuperar..."
                        );


                        hls.recoverMediaError();

                        break;


                    default:

                        console.error(
                            "Error fatal no recuperable."
                        );


                        detenerReproductor();

                        break;

                }

            }

        }
    );

}


/* =========================================================
   COMPROBAR TRANSMISIÓN
========================================================= */

async function comprobarTransmision() {

    if (comprobando) {

        return;

    }


    comprobando = true;


    try {

        /*
            OBTENER CONFIGURACIÓN
        */

        if (
            !apiBaseUrl ||
            !streamBaseUrl
        ) {

            await obtenerConfiguracion();

        }


        /*
            CONSULTAR API DEL REPRODUCTOR
        */

        const respuesta = await fetch(

            `${apiBaseUrl}/api/player?t=${Date.now()}`,

            {
                cache: "no-store"
            }

        );


        if (!respuesta.ok) {

            throw new Error(
                `API HTTP ${respuesta.status}`
            );

        }


        const datos =
            await respuesta.json();


        console.log(
            "Estado Leza TV:",
            datos
        );


        /*
            NO HAY TRANSMISIÓN
        */

        if (
            !datos.online ||
            !datos.playing
        ) {

            if (reproduciendo) {

                detenerReproductor();

            }


            status.classList.remove(
                "hidden"
            );


            status.textContent =
                "🔴 Leza TV está fuera del aire.";


            return;

        }


        /*
            VERIFICAR QUE LA API DEVOLVIÓ HLS
        */

        if (!datos.hls) {

            throw new Error(
                "La API no devolvió una URL HLS."
            );

        }


        /*
            INICIAR TRANSMISIÓN

            IMPORTANTE:
            Usamos directamente datos.hls.

            NO extraemos el Stream Key.
            NO reconstruimos la URL.

            La API DEL SERVIDOR decide cuál es
            la URL correcta.
        */

        if (!reproduciendo) {

            cargarTransmision(
                datos.hls
            );

        }

    }
    catch (error) {

        console.error(
            "Error conectando con Leza Server:",
            error
        );


        if (reproduciendo) {

            detenerReproductor();

        }


        status.classList.remove(
            "hidden"
        );


        status.textContent =
            "⚠️ Leza TV no está transmitiendo. Si ve a alguien mirando Leza TV, avise del error a leza.producciones.cine@gmail.com";

    }
    finally {

        comprobando = false;

    }

}


/* =========================================================
   INICIAR SISTEMA
========================================================= */

comprobarTransmision();


/*
    COMPROBAR EL ESTADO CADA 10 SEGUNDOS
*/

setInterval(

    comprobarTransmision,

    10000

);


/* =========================================================
   CERRAR PÁGINA
========================================================= */

window.addEventListener(

    "beforeunload",

    () => {

        desconectarEspectador();

    }

);


/* =========================================================
   VISIBILIDAD DE LA PÁGINA
========================================================= */

document.addEventListener(

    "visibilitychange",

    () => {

        /*
            SI EL USUARIO OCULTA O CIERRA LA PESTAÑA
        */

        if (
            document.visibilityState === "hidden"
        ) {

            desconectarEspectador();

        }


        /*
            SI VUELVE A LA PÁGINA
        */

        if (
            document.visibilityState === "visible"
        ) {

            if (
                reproduciendo &&
                !espectadorRegistrado
            ) {

                registrarEspectador();

            }

        }

    }

);