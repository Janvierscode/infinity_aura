# Infinity Aura Technologies

![Infinity Aura Technologies](assets/images/infinit_aura_logo.png)

**Innovate. Build. Empower.**

A modern, responsive corporate website for **Infinity Aura Technologies**, a
software development and digital solutions company based in Harare, Zimbabwe.
The site presents the company's services, flagship school management
solutions, technology stack, featured products, and contact information.

## Live Website

Production domain: [www.infinityaura.tech](https://www.infinityaura.tech)

> The production link will work after the repository has been deployed and the
> domain has been connected to the selected hosting provider.

## Features

- Premium dark technology-focused visual design
- Fully responsive desktop, tablet, and mobile layouts
- Sticky navigation with an accessible mobile menu
- Smooth scrolling and active navigation states
- Scroll-based reveal animations
- Animated statistics counters
- Glassmorphism service and product cards
- CSS-rendered product dashboard illustrations
- Client-side contact-form validation
- Direct contact-form delivery through FormSubmit
- Form loading, success, and error feedback
- Honeypot spam protection
- Semantic HTML and keyboard-accessible controls
- Reduced-motion support
- SEO metadata, Open Graph metadata, and organization structured data
- Optimized brand assets for smaller screens
- No frameworks, package manager, or build process required

## Technology

| Layer | Technology |
| --- | --- |
| Structure | HTML5 |
| Styling | CSS3 |
| Interaction | Vanilla JavaScript |
| Form delivery | [FormSubmit](https://formsubmit.co/) |
| Hosting | Any static hosting provider |

## Project Structure

```text
infinity_aura/
├── index.html
├── README.md
├── css/
│   └── style.css
├── js/
│   └── script.js
└── assets/
    ├── icons/
    └── images/
        ├── infinit_aura_favicon.png
        ├── infinit_aura_logo.png
        ├── infinit_aura_tech_icon-640.png
        └── infinit_aura_tech_icon.png
```

## Run Locally

The website can be opened directly by double-clicking `index.html`. Running a
local HTTP server is recommended because it more closely matches production
hosting behavior.

### Python

```bash
python3 -m http.server 4173
```

Open [http://localhost:4173](http://localhost:4173).

### VS Code

Install the **Live Server** extension, open `index.html`, and select
**Open with Live Server**.

## Contact Form Setup

The form submits asynchronously to:

```text
iyakaremyejanvier@gmail.com
```

Delivery is handled by FormSubmit. The first real submission triggers a
one-time activation email from FormSubmit to that Gmail address.

1. Deploy the website or serve it over HTTP.
2. Submit the contact form once.
3. Open the activation email sent to `iyakaremyejanvier@gmail.com`.
4. Confirm the form endpoint.
5. Submit the form again to verify delivery.

Until activation is confirmed, FormSubmit will not forward normal website
enquiries. No email password or API key is stored in this repository.

To change the destination address, update both locations:

- The form `action` in `index.html`
- The AJAX endpoint and fallback message in `js/script.js`

Search the project for `iyakaremyejanvier@gmail.com` to locate every reference.

## Customize the Website

### Company Details

Update company copy, contact details, services, testimonials, and footer content
in `index.html`.

### Theme

The main design tokens are defined at the beginning of `css/style.css`:

```css
:root {
  --background: #0b0f19;
  --surface: #111827;
  --primary: #0a2540;
  --teal: #00b3a4;
  --cyan: #3ddcff;
  --text: #ffffff;
  --muted: #a1a1aa;
}
```

### Brand Assets

Replace files in `assets/images/` while preserving their filenames, or update
the corresponding image paths in `index.html`.

### Social Links

The footer currently uses platform homepages as placeholders. Replace the
LinkedIn, Facebook, X, and GitHub URLs in `index.html` with the company's
official profile links before production launch.

### Testimonials

The current testimonial cards are explicitly labeled as placeholder content.
Replace them with approved client testimonials before representing them as real
customer feedback.

## Deployment

This is a static website, so the repository root is the publish directory and
no build command is needed.

### GitHub Pages

1. Push the repository to GitHub.
2. Open **Settings > Pages** in the GitHub repository.
3. Under **Build and deployment**, select **Deploy from a branch**.
4. Select the production branch, usually `main`, and the `/ (root)` folder.
5. Save and wait for the deployment to complete.

### Netlify

Import the GitHub repository and use:

```text
Build command: leave empty
Publish directory: .
```

### Vercel

Import the repository as a new project and use:

```text
Framework preset: Other
Build command: leave empty
Output directory: .
```

## SEO and Production Checklist

Before launch:

- Confirm that `https://www.infinityaura.tech` is the final canonical domain.
- Add a canonical link in `index.html` when the production URL is confirmed.
- Confirm the structured-data URL and logo URL.
- Test the Open Graph image after deployment.
- Replace placeholder social links.
- Replace placeholder testimonials with approved client statements.
- Activate and test FormSubmit.
- Test the final site on current mobile and desktop browsers.
- Verify that all contact details are current.

## Browser Support

The site targets current versions of:

- Google Chrome
- Microsoft Edge
- Mozilla Firefox
- Safari
- Mobile Safari
- Chrome for Android

Older browsers that do not support `backdrop-filter` still receive readable
solid and translucent surfaces.

## License

Copyright © 2026 Infinity Aura Technologies. All rights reserved.

The source code and brand assets are proprietary unless Infinity Aura
Technologies provides separate written permission for reuse or redistribution.

## Contact

- Website: [www.infinityaura.tech](https://www.infinityaura.tech)
- Email: [info@infinityaura.tech](mailto:info@infinityaura.tech)
- Location: Harare, Zimbabwe
