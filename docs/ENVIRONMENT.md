# Environment

## Local Simulation Mode

No env values are required for simulation mode.

The app will show:

`Live mode is not configured, so this screen uses a fake RPC adapter for safe workflow simulation.`

## Live Mode

Create `.env` from `.env.example`.

Required:

```text
VITE_APP_NAME=Upadhyay_ERP
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Rule

Never commit real `.env` secrets.

