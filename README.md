<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1TDzropILLJHsHYpnXxJc60Qe43jjYmxD

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Configure environment variables in `.env`:
   - `VITE_SUPABASE_URL` - Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key
   - `VITE_MP_CLIENT_ID` - Mercado Pago Client ID (optional)
   - `VITE_MP_CLIENT_SECRET` - Mercado Pago Client Secret (optional)
3. Configure Supabase Edge Function secrets:
   - `GEMINI_API_KEY` - Your Gemini API key (for AI features)
   - `SERVICE_ROLE_KEY` - Supabase service role key
   - `MP_CLIENT_ID` - Mercado Pago Client ID
   - `MP_CLIENT_SECRET` - Mercado Pago Client Secret
4. Run the app:
   `npm run dev`
