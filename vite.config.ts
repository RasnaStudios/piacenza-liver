import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
	assetsInclude: ["**/*.obj"],
	plugins: [
		react(),
		VitePWA({
			disable: true,
			registerType: "autoUpdate",
			injectRegister: "auto",
			includeAssets: ["favicon.png"],
			workbox: {
				cleanupOutdatedCaches: true,
				navigateFallback: "index.html",
				globPatterns: ["**/*.{js,css,html,png,jpg,jpeg,gif,svg,webp,obj,json}"],
				maximumFileSizeToCacheInBytes: 150 * 1024 * 1024,
				runtimeCaching: [
					{
						urlPattern: /\.(?:png|jpg|jpeg|gif|svg|webp)$/,
						handler: "CacheFirst",
						options: {
							cacheName: "images",
							expiration: {
								maxEntries: 100,
								maxAgeSeconds: 60 * 60 * 24 * 30,
							},
						},
					},
					{
						urlPattern: /\.(?:obj)$/,
						handler: "CacheFirst",
						options: {
							cacheName: "models",
							expiration: {
								maxEntries: 20,
								maxAgeSeconds: 60 * 60 * 24 * 30,
							},
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
			"Strict-Transport-Security":
				"max-age=31536000; includeSubDomains; preload",
			"X-Content-Type-Options": "nosniff",
			"X-Frame-Options": "DENY",
			"X-XSS-Protection": "1; mode=block",
			"Referrer-Policy": "strict-origin-when-cross-origin",
		},
	},
	preview: {
		headers: {
			"Strict-Transport-Security":
				"max-age=31536000; includeSubDomains; preload",
			"X-Content-Type-Options": "nosniff",
			"X-Frame-Options": "DENY",
			"X-XSS-Protection": "1; mode=block",
			"Referrer-Policy": "strict-origin-when-cross-origin",
		},
	},
	build: {
		chunkSizeWarningLimit: 1024,
		cssCodeSplit: true,
		rollupOptions: {
			output: {
				manualChunks: {
					three: ["three"],
					vendor: ["react", "react-dom"],
					mantine: ["@mantine/core", "@mantine/hooks"],
				},
			},
		},
	},
});
