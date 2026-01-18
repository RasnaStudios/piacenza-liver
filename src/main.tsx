import { MantineProvider } from "@mantine/core"
import { StrictMode, useState } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import "./i18n/config"
import { MetaTags } from "./components/MetaTags"
import Scene from "./Scene"
import { InscriptionExploration } from "./ui/components/InscriptionExploration"
import { TitleOverlay } from "./ui/components/TitleOverlay"
import { LoadingScreen } from "./ui/LoadingScreen"

function App() {
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [isTitleVisible, setIsTitleVisible] = useState(true)
  const [showLoadingUI, _setShowLoadingUI] = useState(true)

  return (
    <MantineProvider>
      <StrictMode>
        <MetaTags />
        <BrowserRouter>
          <Routes>
            <Route path="/inscriptions" element={<InscriptionExploration />} />
            <Route
              path="/"
              element={
                <>
                  <Scene
                    isLoading={isLoading}
                    setIsLoading={setIsLoading}
                    setLoadingProgress={setLoadingProgress}
                    hasInteracted={hasInteracted}
                    setHasInteracted={setHasInteracted}
                    setTitleVisible={setIsTitleVisible}
                  />
                  <TitleOverlay isVisible={isTitleVisible} />
                  <LoadingScreen
                    progress={loadingProgress}
                    isLoading={isLoading}
                    showLoadingUI={showLoadingUI}
                  />
                </>
              }
            />
          </Routes>
        </BrowserRouter>
      </StrictMode>
    </MantineProvider>
  )
}

const rootElement = document.getElementById("root")
if (!rootElement) {
  throw new Error("Root element not found")
}

createRoot(rootElement).render(<App />)

if ("serviceWorker" in navigator) {
  setTimeout(() => {
    navigator.serviceWorker.register("/sw.js").catch(() => {})
  }, 5000)
}
