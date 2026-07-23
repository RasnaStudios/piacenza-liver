export type SceneProps = {
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  setLoadingProgress: (progress: number) => void
  hasInteracted: boolean
  setHasInteracted: (interacted: boolean) => void
  setTitleVisible: (visible: boolean) => void
}
