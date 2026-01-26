This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## PSG News Agent (MVP)

Admin agent (token): `/admin/agent?token=YOUR_ADMIN_TOKEN`

### Installation

```bash
npm i
npx prisma migrate dev
npm run dev
```

### Jobs (manual trigger)

```bash
curl -X POST http://localhost:3000/api/agent/jobs/ingest \\
  -H "Authorization: Bearer <ADMIN_TOKEN>"

curl -X POST http://localhost:3000/api/agent/jobs/cluster \\
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

### Example sources config (`config/sources.json`)

```json
[
  {
    "name": "PSG.fr",
    "type": "rss",
    "url": "https://www.psg.fr/rss/actualites",
    "language": "fr",
    "reliabilityWeight": 0.9
  },
  {
    "name": "L'Equipe PSG",
    "type": "rss",
    "url": "https://www.lequipe.fr/rss/actu_rss_Football.xml",
    "language": "fr",
    "reliabilityWeight": 0.6
  },
  {
    "name": "BBC Sport PSG",
    "type": "rss",
    "url": "https://feeds.bbci.co.uk/sport/football/rss.xml",
    "language": "en",
    "reliabilityWeight": 0.5
  }
]
```

### Example API payloads

GET `/api/agent/clusters?status=pending`

```json
{
  "clusters": [
    {
      "id": 12,
      "topicTitle": "PSG et le mercato hivernal",
      "status": "pending",
      "category": "Mercato",
      "confidence": 0.5,
      "updatedAt": "2026-01-20T12:03:12.000Z",
      "_count": { "items": 3, "contents": 0, "drafts": 0 }
    }
  ]
}
```

GET `/api/agent/clusters/12`

```json
{
  "cluster": {
    "id": 12,
    "topicTitle": "PSG et le mercato hivernal",
    "status": "pending",
    "items": [
      {
        "id": 44,
        "similarity": 88,
        "item": {
          "id": 301,
          "title": "Le PSG cible un milieu",
          "url": "https://example.com/psg-milieu",
          "publishedAt": "2026-01-20T00:00:00.000Z",
          "source": { "name": "L'Equipe" }
        }
      }
    ],
    "contents": [],
    "drafts": []
  }
}
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
