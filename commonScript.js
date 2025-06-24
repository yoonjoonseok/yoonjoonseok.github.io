document.addEventListener("DOMContentLoaded", () => {
  const nav = document.getElementById("navbar");
  const loader = document.getElementByClassName("loader")[0];
  if (nav) {
    fetch("/common/navbar/navbar.html")
      .then(res => res.text())
      .then(html => {
        nav.innerHTML = html;
      });
  }
  if (loader) {
    fetch("/common/loader/loader.html")
      .then(res => res.text())
      .then(html => {
        loader.innerHTML = html;
      });
  }
});
