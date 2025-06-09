import { useEffect, useState } from 'react'
import './Legend.css'

export function Legend() {
  const [platform, setPlatform] = useState('mac')

  useEffect(() => {
    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase()
    if (userAgent.includes('mac')) {
      setPlatform('mac')
    } else if (userAgent.includes('win')) {
      setPlatform('windows')
    } else {
      setPlatform('linux')
    }
  }, [])

  const getControlsText = () => {
    switch (platform) {
      case 'mac':
        return 'Mouse: rotate • ⌘ + mouse: pan • scroll: zoom'
      case 'windows':
        return 'Mouse: rotate • Alt + mouse: pan • scroll: zoom'
      case 'linux':
        return 'Mouse: rotate • Alt + mouse: pan • scroll: zoom'
      default:
        return 'Mouse: rotate • Alt + mouse: pan • scroll: zoom'
    }
  }

  return (
    <div className="legend">
      <div className="copyright">
        <div>Lorenzo Andraghetti</div>
        <div>Rasna Studios © 2025</div>
      </div>
      <div className="controls">
        {getControlsText()}
      </div>
    </div>
  )
} 