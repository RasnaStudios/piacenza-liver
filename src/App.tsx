import { MantineProvider } from "@mantine/core"
import { lazy, StrictMode, Suspense, useState } from "react"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import { MetaTags } from "./components/MetaTags"
import { SeoContent } from "./components/SeoContent"
import { InscriptionExploration } from "./ui/components/InscriptionExploration"
import { TitleOverlay } from "./ui/components/TitleOverlay"
import { LoadingScreen } from "./ui/LoadingScreen"

const Scene = lazy(() => import("./Scene"))

function HomePage() {
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [isTitleVisible, setIsTitleVisible] = useState(true)
  const [showLoadingUI, _setShowLoadingUI] = useState(true)

  return (
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
      <SeoContent />
    </>
  )
}

export function App() {
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
            <Route path="/" element={<HomePage />} />
            <Route path="/en" element={<HomePage />} />
            <Route path="/it" element={<HomePage />} />
          </Routes>
        </BrowserRouter>
      </StrictMode>
    </MantineProvider>
  )
}
