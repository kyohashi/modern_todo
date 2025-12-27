# Focus Hub

A modern productivity workspace built with Vue and Cloudflare Workers. Focus Hub combines a minimal task backlog with an immersive focus timer to help you maintain deep work sessions.

## Home Workspace
![Home Screen](./assets/home.png)
*Manage your daily tasks with a post-it style interface and calendar integration.*

## Focus Mode
![Focus Mode](./assets/focus.png)
*Immersive timer with analog hand animation to keep you in the zone.*

# 🚀 Self-Hosting on Cloudflare Pages

You can host your own Focus Hub for free.

## 1. Fork this repository
Click the **Fork** button at the top right of this page to create a copy in your own GitHub account.

## 2. Connect to Cloudflare Pages
1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Go to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
3. Select your forked `modern_todo` repository.
4. Set the **Build settings**:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. Click **Save and Deploy**.

## 3. Setup Database (KV)
The app requires Cloudflare KV to store your tasks.
1. In the Cloudflare Dashboard, go to **Workers & Pages** > **KV**.
2. Click **Create namespace** and name it `TODO_KV`.
3. Go back to your Pages project > **Settings** > **Functions**.
4. Scroll down to **KV namespace bindings**.
5. Click **Add binding**:
   - **Variable name**: `TODO_KV`
   - **KV namespace**: Select the `TODO_KV` you just created.
6. **Redeploy** your site for the changes to take effect.
