
(() => {
  "use strict";

  const intro = document.getElementById("intro-logo");

  if (!intro) {
    console.error("[Leza] No se encontró la pantalla inicial.");
    return;
  }

  // La página principal ya está cargada detrás del logo.
  // Mostrar el logo durante 3 segundos.
  const DURACION_INTRO = 3000;
  const DURACION_DESVANECIMIENTO = 700;

  console.log("[Leza] Mostrando intro durante 3 segundos.");

  document.documentElement.style.overflow = "hidden";

  window.setTimeout(() => {
    // Ocultar el logo con una transición.
    intro.classList.add("ocultar");

    window.setTimeout(() => {
      // Retirar la intro para dejar visible la página principal.
      intro.remove();

      // Restaurar el desplazamiento de la página.
      document.documentElement.style.overflow = "";

      console.log("[Leza] Página principal visible.");
    }, DURACION_DESVANECIMIENTO);
  }, DURACION_INTRO);
})();
