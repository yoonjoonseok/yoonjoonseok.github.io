document.addEventListener("DOMContentLoaded", () => {
  const nav = document.getElementById("navbar");
  if (nav) {
    fetch("/common/navbar/navbar.html")
      .then(res => res.text())
      .then(html => {
        nav.innerHTML = html;
      });
  }
});
