document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("contactForm");

    if (!form) return;


    form.addEventListener("submit", function(e) {

        e.preventDefault();


        const params = {

            nombre: document.getElementById("nombre").value,

            email: document.getElementById("email").value,

            asunto: document.getElementById("asunto").value,

            descripcion: document.getElementById("descripcion").value

        };


        emailjs.send(
            "service_4vkgifv",
            "template_peh5hjx",
            params
        )

        .then(() => {

            alert("Consulta enviada correctamente");

            form.reset();

        })

        .catch((error) => {

            console.error("Error EmailJS:", error);

            alert("Error al enviar: " + JSON.stringify(error));

        });


    });


});