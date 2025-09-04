import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tailwind.css'
import Scene from './Scene'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Scene />
  </StrictMode>,
)
