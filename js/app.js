const downloadBtn = document.getElementById("downloadBtn");

downloadBtn.addEventListener("click", () => {

    window.location.href =
        "https://drive.google.com/uc?export=download&id=13AFs5IKjRYO4hukci5pDAerUyM_gmFai";

});
// ===========================
// MODAL DECLARACIÓN
// ===========================

const securityBtn = document.getElementById("securityBtn");
const securityModal = document.getElementById("securityModal");
const closeModal = document.getElementById("closeModal");

securityBtn.addEventListener("click", () => {

    securityModal.style.display = "flex";

});

closeModal.addEventListener("click", () => {

    securityModal.style.display = "none";

});

window.addEventListener("click", (e) => {

    if(e.target === securityModal){

        securityModal.style.display = "none";

    }

});