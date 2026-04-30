import { registerSW } from "virtual:pwa-register"
import { createRoot } from "react-dom/client"
import "@mantine/core/styles.css"
import "./styles/global.css"
import "./i18n/config"
import { App } from "./App"

const rootElement = document.getElementById("root")
if (!rootElement) {
  throw new Error("Root element not found")
}

createRoot(rootElement).render(<App />)

if ("serviceWorker" in navigator) {
  registerSW({ immediate: false })
}
