import { parseTranscription } from '../utils/liverUtils'

interface TranscriptionTextProps {
  transcription: string
  className?: string
  style?: React.CSSProperties
}

export function TranscriptionText({ transcription, className, style }: TranscriptionTextProps) {
  const parts = parseTranscription(transcription)
  
  return (
    <span className={className} style={style}>
      {parts.map((part, index) => (
        <span
          key={index}
          className={part.isReconstructed ? 'text-dark-text/40 font-normal' : 'text-dark-text/95 font-medium'}
        >
          {part.text}
        </span>
      ))}
    </span>
  )
}
