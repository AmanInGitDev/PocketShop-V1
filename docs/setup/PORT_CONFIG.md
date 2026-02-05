# Port Configuration - USE PORT 5173

## ✅ DECISION: Use Port 5173

**Your app runs on:** `http://localhost:5173`

---

## Current Configuration

### ✅ Code (vite.config.ts)
```typescript
server: {
  port: 5173,  // ← This is correct
  open: true
}
```

### ✅ Supabase Dashboard
- **Site URL:** `http://localhost:5173`
- **Redirect URLs:** 
  - `http://localhost:5173/auth/callback`
  - `http://localhost:5173/**`

### ✅ Google Cloud Console
- **Authorized JavaScript origins:** `http://localhost:5173`
- **Authorized redirect URIs:** `http://localhost:5173/auth/callback`

---

## How to Access Your App

**Always use:** `http://localhost:5173`

---

## If Server Doesn't Start

1. **Check if port 5173 is already in use:**
   ```powershell
   netstat -ano | findstr :5173
   ```

2. **If port is in use, kill the process:**
   ```powershell
   taskkill /F /IM node.exe
   ```

3. **Start the server:**
   ```powershell
   npm run dev
   ```

4. **Check terminal output** - it should show:
   ```
   VITE v4.x.x  ready in xxx ms
   ➜  Local:   http://localhost:5173/
   ```

---

## Summary

- **Port:** 5173 ✅
- **URL:** `http://localhost:5173` ✅
- **All configs match:** Yes ✅

**DO NOT use port 3000** - that was old configuration.
