import { useEffect, useId, useState } from "react"
import { isMobile } from "react-device-detect"
import { useTranslation } from "react-i18next"

// Safe localStorage access with error handling
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key)
    } catch (_e) {
      console.warn("localStorage access blocked by browser settings")
      return null
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value)
    } catch (e) {
      console.warn("Failed to write to localStorage", e)
    }
  },
}

export function BraveDisclaimer() {
  const { t } = useTranslation("brave")
  const [showModal, setShowModal] = useState(false)
  const [dontShowAgain, setDontShowAgain] = useState(false)
  const checkboxId = useId()
  const titleId = useId()

  useEffect(() => {
    // Don't show on mobile devices
    if (isMobile) {
      return
    }

    // Check if browser is Brave
    const userAgent = navigator.userAgent
    const isBraveUA = userAgent.includes("Brave") || userAgent.includes("brave")
    const hasBraveAPI = (navigator as { brave?: { isBrave?: boolean } }).brave
      ?.isBrave

    if (!isBraveUA && !hasBraveAPI) {
      return // Not Brave browser
    }

    // Check if user has previously dismissed the warning
    const dismissed = safeLocalStorage.getItem(
      "brave-shields-disclaimer-dismissed",
    )
    if (dismissed === "true") {
      return
    }

    // Since shield detection is unreliable, just show for all Brave users
    // but make it less intrusive by showing after a delay
    setTimeout(() => {
      setShowModal(true)
    }, 2000)
  }, [])

  const handleDismiss = () => {
    setShowModal(false)
    if (dontShowAgain) {
      safeLocalStorage.setItem("brave-shields-disclaimer-dismissed", "true")
    }
  }

  if (!showModal) {
    return null
  }

  // If we can't access localStorage, don't show the "Don't show again" option
  const canSavePreference = (() => {
    try {
      const testKey = "__test__"
      localStorage.setItem(testKey, testKey)
      localStorage.removeItem(testKey)
      return true
    } catch (_e) {
      return false
    }
  })()

  return (
    <>
      {/* Modal backdrop */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          zIndex: 10000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
        onClick={handleDismiss}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            handleDismiss()
          }
        }}
        tabIndex={-1}
      >
        {/* Modal content */}
        <div
          role="document"
          style={{
            backgroundColor: "#0a0806",
            border: "2px solid rgba(139, 101, 65, 0.6)",
            borderRadius: 12,
            padding: "32px",
            maxWidth: "480px",
            width: "100%",
            boxShadow:
              "0 8px 32px rgba(0, 0, 0, 0.6), 0 4px 16px rgba(139, 101, 65, 0.2)",
            textAlign: "center" as const,
            color: "#f4e6d3",
          }}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <div style={{ fontSize: 28, marginBottom: 16, opacity: 0.8 }}>🛡️</div>
          <h3
            id={titleId}
            style={{
              margin: "0 0 16px 0",
              fontSize: 20,
              fontWeight: 500,
              color: "#f4e6d3",
            }}
          >
            {t("title")}
          </h3>
          <p
            style={{
              margin: "0 0 24px 0",
              fontSize: 15,
              lineHeight: 1.5,
              color: "#c9a876",
            }}
          >
            {t("description")}
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              marginBottom: "20px",
              fontSize: "14px",
              color: "#c9a876",
            }}
          >
            {canSavePreference && (
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                }}
              >
                <input
                  id={checkboxId}
                  type="checkbox"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  style={{
                    height: "16px",
                    width: "16px",
                    marginTop: "2px",
                    cursor: "pointer",
                    accentColor: "#c9a876",
                  }}
                />
                <label
                  htmlFor={checkboxId}
                  style={{
                    fontSize: "14px",
                    color: "#c9a876",
                    cursor: "pointer",
                    lineHeight: "1.4",
                  }}
                >
                  {t("dontShowAgain")}
                </label>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            style={{
              background:
                "linear-gradient(45deg, #d4af37 0%, #f0d67c 25%, #d4af37 100%)",
              color: "#0a0806",
              border: "none",
              padding: "12px 24px",
              borderRadius: 6,
              fontSize: 15,
              cursor: "pointer",
              fontWeight: 600,
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
            }}
          >
            {t("continue")}
          </button>
        </div>
      </div>
    </>
  )
}
