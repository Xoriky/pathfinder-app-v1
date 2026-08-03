import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      // import from "@/components/..." instead of "../../components/..."
      "@": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    port: 3000,
    // Proxy Supabase Edge Function calls to the local Supabase CLI server
    // so you can run `supabase functions serve` alongside `vite dev`.
    // Remove this block when deploying — functions.invoke() uses the
    // project URL from VITE_SUPABASE_URL automatically.
    proxy: {
      "/functions": {
        target: "http://127.0.0.1:54321",
        changeOrigin: true,
      },
    },
  },

  build: {
    outDir: "dist",
    // Inline assets smaller than 4 kB to reduce network round-trips
    assetsInlineLimit: 4096,
    // Source maps help Sentry / production debugging without exposing source
    sourcemap: true,
    rollupOptions: {
      output: {
        // Split vendor and app code so the browser can cache supabase-js
        // separately from your application bundle.
        manualChunks: {
          supabase: ["@supabase/supabase-js"],
          react:    ["react", "react-dom"],
        },
      },
    },
  },

  // Expose only VITE_-prefixed vars to the browser bundle.
  // SUPABASE_SERVICE_ROLE_KEY (no VITE_ prefix) is never bundled.
  envPrefix: "VITE_",
});
