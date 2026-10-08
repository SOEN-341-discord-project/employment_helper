# Understanding the CareerConnect front page

## Start here

The front page uses plain HTML, CSS, and JavaScript. It does not use React or a 3D library.

- **client/index.html** contains the page content and structure.
- **client/landing.css** controls appearance, responsive layouts, and animations.
- **client/landing.js** handles mouse movement, scrolling, buttons, and filters.
- **client/favicon.svg** is the small icon in the browser tab.
- **server/index.js** serves `client/index.html` when someone visits `/`.

Open `client/index.html` in a browser to preview the landing page. Account creation, login, and résumé uploads require your existing server and Supabase configuration.

To use this revision in your original project, copy `index.html`, `landing.css`, `landing.js`, and `favicon.svg` into its `client` folder. The root route in `server/index.js` should serve `client/index.html` instead of redirecting to registration. Keep your original `.env` configuration; credentials and installed dependencies are not included in this deliverable. The supplied project copy already contains the root-route change.

## How to read the code

1. Read the section comments in `index.html` to follow the page from top to bottom.
2. Find an element's `class` in `landing.css` to see how it looks.
3. Read the list of setup functions at the top of `landing.js`.
4. Pick one feature and read only its setup function.

Example: `.hero-visual` is the container around the hero illustration. Its CSS sets `perspective`, which makes rotations appear three-dimensional. `setupDashboardTilt()` listens for pointer movement inside that container and updates the dashboard's rotation.

## The JavaScript features

| Function | What it does |
| --- | --- |
| `setupMotionControls()` | Lets visitors pause animations and saves their choice locally. |
| `setupScrollReveals()` | Adds a CSS class when a section enters the visible screen. |
| `setupScrollProgress()` | Updates the thin progress line at the top of the page. |
| `setupDashboardTilt()` | Changes the dashboard's rotation based on pointer position. |
| `setupMobileMenu()` | Opens and closes the small-screen navigation. |
| `setupApplicationTabs()` | Shows sample cards whose stage matches the chosen tab. |
| `updateCopyrightYear()` | Inserts the current year into the footer. |

## How the visual effects work

### Scroll reveals

`IntersectionObserver` is a built-in browser feature that reports when an element enters the screen. Once a section is visible, JavaScript adds `.visible`. CSS then transitions its opacity and position. The observer stops watching that section after its first reveal.

The code leaves content visible if this browser feature is unavailable. Reduced-motion settings also keep the content visible without the entrance animation.

### The 3D dashboard

The dashboard is ordinary HTML, not a 3D model. CSS uses:

- `perspective` to create depth.
- `rotateX`, `rotateY`, and `rotateZ` to change its angle.
- `translateZ` to make floating cards appear closer to the viewer.
- Shadows to reinforce the depth effect.

JavaScript converts the pointer's position inside the artwork to a number between -0.5 and +0.5. Multiplying that number controls how much the dashboard rotates. Removing the inline transform restores its normal CSS angle.

### Continuous animation

CSS `@keyframes` defines the movement for spinning stars, floating cards, and the moving text strip. The `animation` property controls duration, repetition, and timing. `transition` handles a change between two styles, such as a section becoming visible or a button lifting on hover.

### Filtering applications

Each tab has a `data-filter` value, such as `interview`. Each sample card has a `data-stage` value. JavaScript compares the two and updates the card's `hidden` property. Choosing `all` displays every card. This preview does not request or modify real applications.

### Mobile layout

Media queries near the end of the CSS override the base layout at different screen widths. For example, the hero switches from two columns to one on smaller screens. Their order matters, so keep them after the base styles.

### Accessibility

The page supports keyboard navigation, visible focus indicators, a skip link, and screen-reader descriptions. The tabs support arrow keys, Home, and End; Escape closes the mobile menu. `aria-selected` identifies the active tab and `aria-expanded` describes whether the menu is open.

The motion button pauses animations. CSS also respects the device's reduced-motion preference independently, so that device setting continues to suppress CSS animation even if the page button is switched on.

## Common edits

| To change… | Look here |
| --- | --- |
| Main colours | CSS `:root` variables at the top |
| Headline or button text | HTML hero section |
| Animation speed | CSS `animation` properties and `@keyframes` section |
| Tilt strength | `rotationX`, `rotationY`, and `rotationZ` in JavaScript |
| Sample applications | HTML interactive-concept section |
| Tab counts | The number inside each tab's HTML; update these when adding sample cards |
| Phone layout | CSS `@media (max-width: 600px)` section |
| FAQs | HTML `details` elements |

The fonts load from Google Fonts, with local fallback fonts if unavailable. All illustrations and animations are built with HTML, CSS, and the included SVG icon.

## If you are asked to explain the project

“HTML defines the content, CSS handles the design and animation, and JavaScript responds to user input. The 3D dashboard is an HTML illustration rotated with CSS. The scrolling effects use IntersectionObserver, and the application tabs filter sample cards using data attributes.”

The layout and motion styling remain the most advanced part. Start by understanding one effect at a time. Use this guide to learn the implementation, and accurately describe the assistance you received if asked.

## What changed in the readability revision

- Formatted the HTML and CSS with indentation and one declaration per line.
- Added section comments without changing the HTML elements or CSS rule order.
- Grouped JavaScript into named setup functions with local variables and brief explanations.
- Kept the same design, content, links, and interactions.
- Fixed two small motion-state edge cases: retaining the latest saved preference when device settings change, and ignoring a pending tilt update after animations are paused.

This revision covers the new landing page. The existing authentication and résumé code remains separate.
