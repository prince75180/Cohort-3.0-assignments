const header = document.querySelector(".header");

window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    header.classList.add("active");
  } else {
    header.classList.remove("active");
  }
});

const move = document.querySelector(".move");

window.addEventListener("scroll", () => {
  let scroll = window.scrollY;

  move.style.transform = `translateY(${scroll * -0.2}px)`;
});