const CONFIG_URL =
"https://gist.githubusercontent.com/lezaproduccionescine-hash/63a485bfecd6885e460cfca93b516285/raw/leza-tv-config.json";

const liveBadge = document.getElementById("liveBadge");
const video = document.getElementById("video");
const status = document.getElementById("status");

let hls = null;
let reproduciendo = false;
let comprobando = false;

let apiBaseUrl = null;
let streamBaseUrl = null;

async function obtenerConfiguracion() {

    const respuesta = await fetch(
        CONFIG_URL + "?t=" + Date.now(),
        { cache: "no-store" }
    );

    if (!respuesta.ok) {

        throw new Error(
            `Error obteniendo configuración: HTTP ${respuesta.status}`
        );

    }

    const configuracion = await respuesta.json();

    if (!configuracion.api || !configuracion.stream) {

        throw new Error(
            "La configuración no contiene api y stream"
        );

    }

    apiBaseUrl = configuracion.api.replace(/\/$/, "");
    streamBaseUrl = configuracion.stream.replace(/\/$/, "");

}

function detenerReproductor() {

    if (hls) {

        hls.destroy();
        hls = null;

    }

    liveBadge.classList.add("hidden");
    
    video.pause();

    video.removeAttribute("src");

    video.load();

    reproduciendo = false;

    status.classList.remove("hidden");

    status.textContent =
        "Esperando transmisión...";

}

function cargarTransmision(streamKey) {

    if (reproduciendo) {
        return;
    }

    const hlsUrl =
        `${streamBaseUrl}/live/${streamKey}/index.m3u8`;

    console.log("Reproduciendo:", hlsUrl);

    status.classList.remove("hidden");

    status.textContent =
        "Cargando transmisión...";

    if (typeof Hls === "undefined") {

        status.textContent =
            "Error cargando HLS";

        return;

    }

    if (!Hls.isSupported()) {

        video.src = hlsUrl;

        video.play();

        status.classList.add("hidden");

        return;

    }

    reproduciendo = true;

    hls = new Hls();

    hls.attachMedia(video);

    hls.on(Hls.Events.MEDIA_ATTACHED, () => {

        console.log("MEDIA ATTACHED");

        hls.loadSource(hlsUrl);

    });

    hls.on(Hls.Events.MANIFEST_PARSED, async () => {

        try {

            await video.play();

            liveBadge.classList.remove("hidden");

            status.classList.add("hidden");

        } catch (e) {

            console.error(e);

        }

    });

    hls.on(Hls.Events.ERROR, (event, data) => {

        console.error(data);

        if (data.fatal) {

            detenerReproductor();

        }

    });

}

async function comprobarTransmision() {

    if (comprobando) {
        return;
    }

    comprobando = true;

    try {

        if (!apiBaseUrl || !streamBaseUrl) {
            await obtenerConfiguracion();
        }

        const respuesta = await fetch(
            `${apiBaseUrl}/api/player?t=` + Date.now(),
            {
                cache: "no-store"
            }
        );

        if (!respuesta.ok) {
            throw new Error(
                `API HTTP ${respuesta.status}`
            );
        }

        const datos = await respuesta.json();

        console.log(datos);

        if (!datos.online || !datos.playing) {

            if (reproduciendo) {
                detenerReproductor();
            }

            status.classList.remove("hidden");
            status.textContent =
                "🔴 Leza TV está fuera del aire.";

            return;

        }

        const partes = datos.hls
            .replace(/\/$/, "")
            .split("/");

        const streamKey =
            partes[partes.length - 1];

        if (!streamKey) {

            throw new Error(
                "No se pudo obtener el Stream Key."
            );

        }

        if (!reproduciendo) {

            cargarTransmision(streamKey);

        }

    }
    catch (error) {

        console.error(
            "Error conectando con Leza Server:",
            error
        );

        status.classList.remove("hidden");
        status.textContent =
            "No se pudo conectar con Leza Server.";

    }
    finally {

        comprobando = false;

    }

}

comprobarTransmision();

setInterval(
    comprobarTransmision,
    10000
);