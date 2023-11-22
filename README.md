This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

It uses a drag and drop component derived from [innocentanyaele's Medium post](https://innocentanyaele.medium.com/create-a-drag-and-drop-file-component-in-reactjs-nextjs-tailwind-6ae70ba06e4b).

## Getting Started

1. `yarn install` or your preferred equivalent to install dependencies.
2. `yarn dev` to run the development server.
3. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## What it does

The `parseMessages` function is a hand-rolled, awful parser for the awful plain text chat output that Zoom gives you.

Everything is done client side, no data leaves your browser, there is no server.

Parsing is all handled on the main thread, this seems fine on a desktop machine with files up to about 100KB so far.

There are no unit tests. The parser has been tested on a handful of files from late 2023.

Deploys are handled by Vercel automatically from `main`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!
