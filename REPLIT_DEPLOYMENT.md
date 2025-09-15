# GoSafe Replit Deployment Guide

## 🚀 Deploying GoSafe Web Portal on Replit

### 1. Initial Setup in Replit

1. **Create a new Repl**:

   - Choose "Node.js" template
   - Import from GitHub: `https://github.com/singhuday26/gosafe`

2. **Install Dependencies**:
   ```bash
   npm install
   ```

### 2. Configure Vite for Replit

Your `vite.config.ts` should include:

```typescript
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 8080,
    allowedHosts: true, // Allow all hosts for Replit
    cors: true,
    hmr: {
      clientPort: process.env.REPLIT_DEV_DOMAIN ? 443 : 8080,
      host: process.env.REPLIT_DEV_DOMAIN || "localhost",
    },
  },
  // ... rest of config
}));
```

### 3. Create/Update `.replit` file

```toml
run = "npm run dev"
entrypoint = "src/main.tsx"

[env]
NODE_ENV = "development"

[nix]
channel = "stable-22_11"

[deployment]
run = ["sh", "-c", "npm run build && npm run preview"]
deploymentTarget = "static"

[[ports]]
localPort = 8080
externalPort = 80
exposeLocalhost = true

[languages.typescript]
pattern = "**/{*.ts,*.tsx}"

[languages.typescript.languageServer]
start = "typescript-language-server --stdio"
```

### 4. Update Package.json Scripts

Ensure your `package.json` has these scripts:

```json
{
  "scripts": {
    "dev": "vite --host 0.0.0.0 --port 8080",
    "build": "tsc -b && vite build",
    "preview": "vite preview --host 0.0.0.0 --port 8080",
    "start": "npm run dev"
  }
}
```

### 5. Environment Variables (if needed)

Create `.env` file:

```bash
# Add any environment variables your app needs
VITE_API_URL=your_api_url_here
# Don't commit sensitive keys to public repos
```

### 6. Common Replit Issues & Solutions

#### Issue 1: "Module not found" errors

**Solution**: Clear node_modules and reinstall

```bash
rm -rf node_modules package-lock.json
npm install
```

#### Issue 2: Build fails

**Solution**: Check if all dependencies are installed

```bash
npm install --save-dev @types/node
```

#### Issue 3: HMR not working

**Solution**: The vite.config.ts above should fix this with proper HMR configuration

#### Issue 4: 404 on refresh

**Solution**: Add this to your vite.config.ts:

```typescript
build: {
  rollupOptions: {
    input: {
      main: resolve(__dirname, "index.html");
    }
  }
}
```

### 7. Deployment Steps

1. **Development Mode**:

   ```bash
   npm run dev
   ```

2. **Production Build**:

   ```bash
   npm run build
   npm run preview
   ```

3. **For Replit Deployment**:
   - Click "Deploy" in Replit
   - Choose "Static Site" deployment
   - Set build command: `npm run build`
   - Set publish directory: `dist`

### 8. Troubleshooting Your Specific Error

If you're still getting the host error, try:

1. **Update your specific Replit URL** in vite.config.ts:

   ```typescript
   allowedHosts: [
     "575b4e1d-1a8b-47a9-a4aa-7f03d1f3c615-00-1usys5vcw12yv.riker.replit.dev",
     "*.replit.dev",
     "*.repl.co",
   ];
   ```

2. **Use environment variables**:

   ```typescript
   allowedHosts: [
     process.env.REPLIT_DEV_DOMAIN,
     "*.replit.dev",
     "*.repl.co",
   ].filter(Boolean);
   ```

3. **Disable host checking** (temporary):
   ```typescript
   server: {
     host: "0.0.0.0",
     port: 8080,
     allowedHosts: "all" // Use with caution
   }
   ```

### 9. GoSafe Specific Considerations

Since your app has:

- **Multilingual support**: Ensure all translation files are included
- **Supabase integration**: Add environment variables for Supabase
- **MapBox integration**: Add MapBox token to environment variables

### 10. Final Checklist

- ✅ Vite config updated for Replit
- ✅ Package.json scripts configured
- ✅ Dependencies installed
- ✅ Environment variables set
- ✅ Build command works
- ✅ All translation files included
- ✅ No hardcoded localhost URLs

Your GoSafe multilingual tourism safety app should now work perfectly on Replit! 🎉
