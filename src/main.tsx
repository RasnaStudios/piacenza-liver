import { registerSW } from "virtual:pwa-register"
import { MantineProvider } from "@mantine/core"
import { lazy, StrictMode, Suspense, useEffect, useState } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import "@mantine/core/styles.css"
import "./styles/global.css"
import "./i18n/config"
import { MetaTags } from "./components/MetaTags"
import { InscriptionExploration } from "./ui/components/InscriptionExploration"
import { TitleOverlay } from "./ui/components/TitleOverlay"
import { LoadingScreen } from "./ui/LoadingScreen"

const Scene = lazy(() => import("./Scene"))

function App() {
  useEffect(() => {
    document.body.dataset.prerenderReady = "true"
  }, [])
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [isTitleVisible, setIsTitleVisible] = useState(true)
  const [showLoadingUI, _setShowLoadingUI] = useState(true)

  const isPrerendering =
    typeof window !== "undefined" &&
    (window as Window & { __PRERENDERING?: boolean }).__PRERENDERING

  const homeElement = isPrerendering ? (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: 24,
        textAlign: "center",
      }}
    >
      <h2 style={{ fontFamily: "var(--font-primary)", fontWeight: 400 }}>
        Piacenza Liver
      </h2>
      <p style={{ marginTop: 8, maxWidth: 480 }}>
        3D interactive reconstruction of the Etruscan Piacenza Liver. All 42
        deity inscriptions with scholarly annotations for archaeology and
        education.
      </p>
      <a
        href="/inscriptions/"
        style={{
          marginTop: 16,
          display: "inline-block",
          padding: "10px 16px",
          border: "1px solid #c9a876",
          color: "#c9a876",
          textDecoration: "none",
          borderRadius: 6,
        }}
      >
        Explore inscriptions
      </a>
    </div>
  ) : (
    <>
      <Suspense fallback={null}>
        <Scene
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          setLoadingProgress={setLoadingProgress}
          hasInteracted={hasInteracted}
          setHasInteracted={setHasInteracted}
          setTitleVisible={setIsTitleVisible}
        />
      </Suspense>
      <TitleOverlay isVisible={isTitleVisible} />
      <LoadingScreen
        progress={loadingProgress}
        isLoading={isLoading}
        showLoadingUI={showLoadingUI}
      />
    </>
  )

  return (
    <MantineProvider
      theme={{
        fontFamily: "var(--font-primary)",
        headings: {
          fontFamily: "var(--font-display)",
          fontWeight: "400",
        },
      }}
    >
      <StrictMode>
        <BrowserRouter>
          <MetaTags />
          <Routes>
            <Route path="/inscriptions" element={<InscriptionExploration />} />
            <Route
              path="/en/inscriptions"
              element={<InscriptionExploration />}
            />
            <Route
              path="/it/inscriptions"
              element={<InscriptionExploration />}
            />
            <Route path="/" element={homeElement} />
            <Route path="/en" element={homeElement} />
            <Route path="/it" element={homeElement} />
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
  registerSW({ immediate: false })
}
