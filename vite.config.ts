import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
	assetsInclude: ["**/*.obj"],
	plugins: [
		react(),
		VitePWA({
			disable: true, // Disable for now, to prevent caching issues
			registerType: "autoUpdate",
			injectRegister: "auto",
			includeAssets: ["favicon.png"],
			workbox: {
				cleanupOutdatedCaches: true,
				navigateFallback: "index.html",
				// Precache app shell and static assets including images/OBJ/JSON
				globPatterns: ["**/*.{js,css,html,png,jpg,jpeg,gif,svg,webp,obj,json}"],
				// Allow large assets (textures / OBJ) to be precached
				maximumFileSizeToCacheInBytes: 150 * 1024 * 1024,
				// Optional runtime caching for images/OBJ/JSON
				runtimeCaching: [
					{
						urlPattern: /\.(?:png|jpg|jpeg|gif|svg|webp)$/,
						handler: "CacheFirst",
						options: {
							cacheName: "images",
							expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
						},
					},
					{
						urlPattern: /\.(?:obj)$/,
						handler: "CacheFirst",
						options: {
							cacheName: "models",
							expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 30 },
						},
					},
					{
						urlPattern: /segmentation_atlas\.json$/,
						handler: "StaleWhileRevalidate",
						options: { cacheName: "json" },
					},
				],
			},
			manifest: {
				name: "Piacenza Liver",
				short_name: "Liver",
				start_url: "/",
				display: "standalone",
				background_color: "#000000",
				theme_color: "#000000",
				icons: [{ src: "favicon.png", sizes: "any", type: "image/svg+xml" }],
			},
		}),
	],
	server: {
		headers: {
			"Cache-Control": "no-cache, no-store, must-revalidate",
			Pragma: "no-cache",
			Expires: "0",
		},
	},
	preview: {
		headers: {
			"/data/inscriptions.json": {
				"Content-Type": "application/json",
				"Cache-Control": "public, max-age=86400, s-maxage=86400",
			},
		},
	},
	build: {
		chunkSizeWarningLimit: 1024,
		rollupOptions: {
			output: {
				manualChunks: {
					three: ["three"],
					vendor: ["react", "react-dom"],
				},
			},
		},
	},
});
