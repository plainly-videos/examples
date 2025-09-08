# Render and webhook handling example

This example demonstrates how to build a complete end-to-end video generation workflow with webhook handling using [Plainly Videos REST API](https://www.plainlyvideos.com/). 

## What this App does?

**Non-technical view:**
Create professional sports matchup videos automatically! Simply select two teams from a dropdown menu, and the app generates a custom video preview showing the upcoming game with team logos, and names.

**Technical view:**
This is a full-stack web application that demonstrates programmatic video generation through API integration. Users create matchup requests via a form interface, which triggers video rendering jobs through the Plainly Videos API. The app uses webhooks to receive real-time notifications when videos are complete, automatically updating the database.

## What you'll learn

By working through this example, you'll understand how to:

- **🎬 Video generation**: Integrate with Plainly Videos API to programmatically create videos.
- **🔄 Webhook handling**: Set up an endpoint to receive and process webhook notifications, in order to track video render jobs and their statuses.
- **🌐 Development Workflow**: Use tunneling for local webhook development and testing.
- **🏗️ Full-stack Architecture**: Build a complete app with form handling, API routes, and data persistence.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [pnpm](https://pnpm.io/) package manager
- [Docker](https://www.docker.com/), including [Docker Compose](https://docs.docker.com/compose/), for running a local PostgreSQL instance

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
3. Upload the After Effects project used in this example to Plainly:
   - Download the example project from [here](./after-effects/Sports%20Matchup.zip).
   - Go to [Upload form](https://app.plainlyvideos.com/dashboard/projects/create) and upload the project.
   - Once the upload is done, auto-generate a template with prefix option:
      - Set the target composition to `editRender`
      - Click on "Generate"
      - This will generate a template with few parameters from layers.
4. Set up environment variables:

    ```bash
      cp .env.example .env.local
    ```
    Update `.env.local` with your API key from [Plainly settings](https://app.plainlyvideos.com/dashboard/user/settings/general) and the project `ID` from the project you just uploaded.
    ```bash
    PLAINLY_API_KEY=your_plainly_api_key
    PLAINLY_PROJECT_ID=your_plainly_project_id
    ```
5. Start the development environment:

    ```bash
      pnpm dev:full
    ```
    This command will:
    - Generate and push Prisma schema
    - Create a unique tunnel URL automatically
    - Update your `.env.local` with the tunnel URL
    - Start the Next.js development server

    The output will show your unique tunnel URL, and app started message:

    ```bash
    🌐 Tunnel URL: https://abc123.loca.lt
    📨 Webhook URL: https://abc123.loca.lt/api/webhook

      ▲ Next.js 15.5.0
      - Local:        http://localhost:3000
      - Network:      http://192.168.0.109:3000
      - Environments: .env.local

    ✓ Starting...
    ✓ Ready in 1376ms
    ```

## Usage

- Open app by visiting http://localhost:3000.
- Create a new matchup by filling out the form with two teams from a dropdown.
- Table below the form displays all created matchups.
- Once a matchup is created, a video rendering job is queued in Plainly.
- When the video is ready, a webhook from Plainly updates the database and the video appears in the table. Hit refresh in order to update the list.

## Useful commands

 - `pnpm dev:full` - Starts the app in development mode with the webhook tunnel setup.
 - `pnpm start:full` - Builds and starts the app in preview mode with the webhook tunnel setup.
 - `pnpm db:stop` - Stops PostgreSQL instance by executing a docker-compose stop.
 - `pnpm db:remove` - Stops PostgreSQL instance and removes any data in the database.
