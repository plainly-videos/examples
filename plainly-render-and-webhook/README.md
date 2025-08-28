# Plainly Render and Webhook

This example demonstrates how to build a complete end-to-end video generation workflow with webhook handling using [Plainly Videos](https://www.plainlyvideos.com/), [Next.js](https://nextjs.org), [PostgreSQL](https://www.postgresql.org/) and [Prisma](https://www.prisma.io/) as ORM.

## What This App Does

**Non-Technical View:**
Create professional sports matchup videos automatically! Simply select two teams from a dropdown menu, and the app generates a custom video preview showing the upcoming game with team logos, and names.

**Technical View:**
This is a full-stack web application that demonstrates programmatic video generation through API integration. Users create matchup requests via a form interface, which triggers video rendering jobs through the Plainly Videos API. The app uses webhooks to receive real-time notifications when videos are complete, automatically updating the database and UI.

## What You'll Learn

By working through this example, you'll understand how to:

- **🎬 Video Generation**: Integrate with Plainly Videos API to programmatically create videos
- **🔄 Webhook Handling**: Set up endpoints to receive and process webhook notifications  
- **🗄️ Database Management**: Store and track video render jobs and their statuses
- **⚡ Real-time Updates**: Update your UI when external processes (video rendering) complete
- **🌐 Development Workflow**: Use tunneling for local webhook development and testing
- **🏗️ Full-stack Architecture**: Build a complete app with form handling, API routes, and data persistence

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [pnpm](https://pnpm.io/) package manager
- [Docker](https://www.docker.com/) for running a local PostgreSQL instance

## Getting Started

1. Clone the repository:

```bash
  git clone https://github.com/plainly-videos/examples.git
  cd plainly-render-and-webhook
```
2. Install dependencies:

```bash
  pnpm install
```

3. Upload an example project to Plainly:
- Download the example project from [here](./Sports%20Matchup.zip).
- Go to [Upload form](https://app.plainlyvideos.com/dashboard/projects/create) and upload the project.
- Once the upload is done, auto-generate a template with prefix option:
  - Set the target composition to `editRender`
  - Set the prefix to `plainly`
  - Click on "Generate"

This will generate a template with few parameters from layers.

4. Set up environment variables:

```bash
  cp .env.example .env.local
```

Update `.env.local` with your API key from [Plainly Settings](https://app.plainlyvideos.com/dashboard/user/settings/general) and the Project ID from the project you just uploaded.
```bash
NEXT_PUBLIC_PLAINLY_API_KEY=your_plainly_api_key
NEXT_PUBLIC_PLAINLY_PROJECT_ID=your_plainly_project_id
```

5. Start the development environment:

Then start the app with tunnel:
```bash
  pnpm dev:full
```

This command will:
- Generate and push Prisma schema
- Create a unique tunnel URL automatically
- Update your `.env.local` with the tunnel URL
- Start the Next.js development server

The output will show your unique tunnel URL:
```bash
  🌐 Tunnel URL: https://abc123.loca.lt
  📨 Webhook URL: https://abc123.loca.lt/api/webhook
```

Each time you run this command, you'll get a fresh, unique tunnel URL that won't conflict with other developers.

## Troubleshooting

### Tunnel Issues
- The auto-tunnel script includes retry logic for reliability

### Webhook Issues
- Check the webhook status indicator in the UI
- Verify your `.env.local` file has the correct `NEXT_PUBLIC_WEBHOOK_PUBLIC_URL`
- Test your webhook endpoint at: `{your-tunnel-url}/api/webhook`

### Database Issues
- Ensure PostgreSQL is running: `pnpm db:start`
- Reset database if needed: `docker compose down -v && pnpm db:start`

> **Note:** To keep track of your database, you can run a Prisma Studio instance:
```bash
  docker compose exec app pnpm prisma studio 
```

## Usage

- Create a new matchup by filling out the form with two teams from a dropdown.
- Table below the form displays all created matchups.
- Once a matchup is created, a video rendering job is queued in Plainly.
- When the video is ready, a webhook from Plainly updates the database and the video appears in the table.
