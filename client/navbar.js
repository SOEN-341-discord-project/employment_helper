document.getElementById("navbar").innerHTML = `
  <nav class="navbar">
    <a href="resume.html" title="Home">
      <img src="home.png" >
    </a>
    <a href="profile.html" title="Your profile">
      <img src="profile.png" >
    </a>

    <a href="login.html" id="logout" title="Log out">
      <img src="logout.png" >
    </a>
  </nav>
`;

const links = document.querySelectorAll(".navbar a");

for (let i = 0; i < links.length; i++) {

  /* if a link path matches currently active path then said link is active*/
  if (links[i].pathname === window.location.pathname) {
    links[i].classList.add("active");
  }
}