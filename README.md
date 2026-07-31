# Workout Tracking App

A Next.js application for tracking and managing your workout routines.

## Cloudflare KV Setup

This app uses Cloudflare KV to store workout data. Follow these steps to set it up:

### Prerequisites

1. A Cloudflare account
2. Wrangler CLI installed: `npm install -g wrangler`
3. Authenticated Wrangler: `wrangler login`

### Create a KV Namespace

```bash
# Create a KV namespace
wrangler kv:namespace create "WORKOUT_KV"

# Create a preview KV namespace for development
wrangler kv:namespace create "WORKOUT_KV" --preview
```

After running these commands, Wrangler will output the namespace IDs. Update your `wrangler.toml` file with these IDs:

```toml
kv_namespaces = [
  { binding = "WORKOUT_KV", id = "YOUR_NAMESPACE_ID", preview_id = "YOUR_PREVIEW_NAMESPACE_ID" }
]
```

### Configure Deployment

1. Update the `wrangler.toml` with your domain information:
   ```toml
   routes = [
     { pattern = "your-domain.com/api/workout*", zone_name = "your-domain.com" }
   ]
   
   [env.production]
   route = "your-domain.com/api/workout*"
   zone_id = "YOUR_ZONE_ID"
   ```

2. Deploy your worker:
   ```bash
   wrangler deploy
   ```

### Testing Locally

Run your application locally with Wrangler's dev environment:

```bash
wrangler dev
```

## API Endpoints

### Save a Workout
- **POST** `/api/workout`
- Body:
  ```json
  {
    "userId": "user-1",
    "date": "2024-04-15",
    "dayId": "day1",
    "completed": true,
    "exercises": []
  }
  ```

### Get a Workout
- **GET** `/api/workout?userId=user-1&date=2024-04-15`

### Get All Workouts
- **GET** `/api/workout?userId=user-1`

### Get Workout History
- **GET** `/api/workout/history?userId=user-1`

## Development

```bash
npm install
npm run dev
``` 