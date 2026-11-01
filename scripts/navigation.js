const menuButton = document.querySelector("#menu-button");
const nav = document.querySelector("#primary-nav");

menuButton.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", isOpen);
  menuButton.textContent = isOpen ? "✕" : "☰";
});
