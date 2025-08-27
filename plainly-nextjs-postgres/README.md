This is a [Plainly](https://www.plainlyvideos.com/), [Next.js](https://nextjs.org) and [PostgreSQL](https://www.postgresql.org/) example project.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [pnpm](https://pnpm.io/) package manager
- [Docker](https://www.docker.com/) for running a local PostgreSQL instance

## Getting Started

1. Clone the repository:

```bash
  git clone https://github.com/plainly-videos/examples.git
  cd plainly-nextjs-postgres
```
2. Install dependencies:

```bash
  pnpm install
```

3. Upload an example project to Plainly:
- Download the example project from [here](TODO: update).
- Go to [Upload form](https://app.plainlyvideos.com/dashboard/projects/create) and upload the project.
- Once the upload is done, create a new template with few parameters from layers:

  | Layer | Parameter |
  |--------|-----------------|
  | editTeam1 | team1 |
  | editTeam2 | team2 |
  | TEAM 1    | team1 |
  | TEAM 2    | team2 |
  | editLogo1 | team1logo |
  | editLogo2 | team2logo |

- Save the template

4. Set up environment variables:

```bash
  cp .env.example .env.local
```

Update `.env.local` with your API key from [Plainly Settings](https://app.plainlyvideos.com/dashboard/user/settings/general) and the Project ID from the project you just uploaded.
```bash
NEXT_PUBLIC_PLAINLY_API_KEY=your_plainly_api_key
NEXT_PUBLIC_PLAINLY_PROJECT_ID=your_plainly_project_id
```

5. Start a local PostgreSQL instance and Next.js app using Docker Compose:

```bash
  docker-compose up --build
```

Final message should be:
```bash
  plainly_app  |  ✓ Ready in Xms
```

6. Open new Terminal and run a tunnel to expose your local server (required for webhooks):
```bash
  pnpm tunnel
```

Response should be:
```bash
  your url is: https://plainly-nextjs-postgres.loca.lt
```

Open the URL in your browser.

> **Note:** To keep track of your database, you can use run a Prisma Studio instance:
```bash
  docker compose exec app pnpm prisma studio 
```


## Usage

- Create a new matchup by filling out the form with two teams from a dropdown.
- Table below the form displays all created matchups.
- Once a matchup is created, a video rendering job is queued in Plainly.
- When the video is ready, a webhook from Plainly updates the database and the video appears in the table.