# JL Web Design

A simple marketing website for JL Web Design — a web design studio for small businesses.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Adding Portfolio Projects

When you have work to showcase, edit `src/data/portfolio.ts`:

```ts
{
  id: "my-project",
  title: "Client Name",
  description: "A brief description of the project.",
  tags: ["Web Design", "E-commerce"],
  href: "https://example.com",      // link to live site
  image: "/portfolio/my-project.png", // optional screenshot
  comingSoon: false,                // set to false when ready to show
}
```

Place project images in the `public/portfolio/` folder.

## Logo files

The site uses two logo variants in `public/logo/`:

- **Full logo** (`logo-full`) — emblem + "JL WEB DESIGN" on the homepage hero
- **Icon** (`logo-icon`) — JL monogram only in the header and footer

SVG fallbacks are included. To use your exact PNG files, add these to `public/logo/`:

- `logo-full.png` — your full logo image
- `logo-icon.png` — cropped JL monogram only (top of the logo)

The site will automatically prefer the PNG files when present.

## Deploy

This is a standard Next.js app and can be deployed to [Vercel](https://vercel.com) or any platform that supports Next.js.
