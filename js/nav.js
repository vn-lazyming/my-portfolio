// Determines the correct base path depending on how deep the current page is.
// Pages in root: base = ""  |  Pages one level deep (e.g. blog/): base = "../"
const base = window.location.pathname.includes('/blog/') ? '../' : '';

const isOnBlog = window.location.pathname.includes('/blog/');

document.getElementById('topNav').innerHTML = `
  <a href="${base}index.html">LazyMingg</a>
  <button class="hambergerButton" onclick="hambergerMenu()">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
      stroke="currentColor" class="hambergerIcon">
      <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  </button>
  <nav class="navBar" id="navBar">
    <a href="${base}index.html#hero-link">ABOUT</a>
    <a href="${base}index.html#skill-link">SKILL</a>
    <a href="${base}index.html#project-link">PROJECTS</a>
    <a href="${base}index.html#contact-link">CONTACT</a>
    <a href="${base}blog/index.html" ${isOnBlog ? 'style="color: var(--color-primary);"' : ''}>BLOG</a>
  </nav>
`;
