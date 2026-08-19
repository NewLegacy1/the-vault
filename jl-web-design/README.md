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

- `logo-full.svg` — full logo with text (homepage hero)
- `logo-icon.svg` — JL monogram only (header and footer)

To swap in your exact PNG files, add `logo-full.png` and `logo-icon.png` to `public/logo/` and update the paths in `src/components/Logo.tsx`.

## Deploy

This is a standard Next.js app and can be deployed to [Vercel](https://vercel.com) or any platform that supports Next.js.
