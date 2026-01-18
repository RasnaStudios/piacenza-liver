import "./InteractionButton.css"

interface InteractionButtonProps {
  onClick: (e: React.MouseEvent) => void
  children: React.ReactNode
  size?: "sm" | "md" | "lg"
  variant?: "filled" | "outline" | "text"
  isEnabled?: boolean
  disableAnimation?: boolean
}

export function InteractionButton({
  onClick,
  children,
  size = "md",
  variant = "filled",
  isEnabled,
  disableAnimation = false,
}: InteractionButtonProps) {
  if (isEnabled === false) {
    return null
  }

  return (
    <button
      className={`interaction-button interaction-button-${size} interaction-button-${variant} ${variant === "text" ? `interaction-button-text-${size}` : ""}`}
      onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
        onClick(e as React.MouseEvent)
      }
      type="button"
    >
      {variant === "text" ? (
        <span
          className={`title-subtle interaction-button-text-content ${
            disableAnimation ? "" : "title-gradient"
          }`}
        >
          {children}
        </span>
      ) : (
        <span className="button-text">{children}</span>
      )}
    </button>
  )
}
