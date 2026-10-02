export function preferiti() {


const favButtons = document.querySelectorAll(".btn-fav");

favButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        const icon = btn.querySelector("i");
        if (icon.classList.contains("bi-heart")) {
            icon.classList.remove("bi-heart");
            icon.classList.add("bi-heart-fill");
        } else {
            icon.classList.remove("bi-heart-fill");
            icon.classList.add("bi-heart");
        }
    });
});

}