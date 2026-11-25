document.getElementById("navbar").innerHTML = `
  <nav class="navbar">
    <a href="jobs.html" title="Job listings" aria-label="Job listings">
      <img src="home.png" >
    </a>
    <a href="profile.html" title="Your profile">
      <img src="profile.png" >
    </a>

    <!-- Link application tracking and the job seeker's analytics dashboard from the shared menu. -->
    <a href="applications.html" class="nav-label">My apps</a>
    <a href="dashboard.html" class="nav-label">Dashboard</a>
    <a href="recruiter.html" class="nav-label">Recruiter</a>

    <a href="notifications.html" title="Notifications">
      <img src="notifications.png" >
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
