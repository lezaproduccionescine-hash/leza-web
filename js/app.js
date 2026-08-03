const downloadBtn = document.getElementById("downloadBtn");

if (downloadBtn) {

    downloadBtn.addEventListener("click", () => {

        window.location.href =
        "https://github.com/lezaproduccionescine-hash/leza-web/releases/latest/download/Leza.TV.Setup.1.0.0.exe";

    });

}

// ===========================
// MODAL DECLARACIÓN
// ===========================

const securityBtn = document.getElementById("securityBtn");
const securityModal = document.getElementById("securityModal");
const closeModal = document.getElementById("closeModal");


if (securityBtn && securityModal) {

    securityBtn.addEventListener("click", () => {

        securityModal.style.display = "flex";

    });

}


if (closeModal && securityModal) {

    closeModal.addEventListener("click", () => {

        securityModal.style.display = "none";

    });

}


if (securityModal) {

    window.addEventListener("click", (e) => {

        if(e.target === securityModal){

            securityModal.style.display = "none";

        }

    });

}

// =========================
// MODAL NUESTROS PLANES
// =========================

const plansBtn = document.getElementById("plansBtn");
const plansModal = document.getElementById("plansModal");
const closePlans = document.getElementById("closePlans");

const planImage = document.getElementById("planImage");
const prevPlan = document.getElementById("prevPlan");
const nextPlan = document.getElementById("nextPlan");


let currentPlan = 1;


if (plansBtn) {


    plansBtn.addEventListener("click", () => {

        plansModal.style.display = "flex";

    });


}


if (closePlans) {


    closePlans.addEventListener("click", () => {

        plansModal.style.display = "none";

    });


}



function changePlan(){


    if(currentPlan === 1){

        planImage.src = "assets/plan1.png";

    } else {

        planImage.src = "assets/plan2.png";

    }


}



if(nextPlan){


    nextPlan.addEventListener("click",()=>{


        currentPlan = 2;

        changePlan();


    });


}



if(prevPlan){


    prevPlan.addEventListener("click",()=>{


        currentPlan = 1;

        changePlan();


    });


}



window.addEventListener("click",(e)=>{


    if(e.target === plansModal){

        plansModal.style.display = "none";

    }


});

// ===========================
// DESCARGA CLAQUETA EN APUROS
// ===========================

const downloadGameBtn = document.getElementById("downloadGameBtn");

if (downloadGameBtn) {

    downloadGameBtn.addEventListener("click", () => {

        window.location.href =
        "https://github.com/lezaproduccionescine-hash/leza-web/releases/download/v1.0.1/claqueta.en.apuros.Setup.1.0.0.exe";

    });

}