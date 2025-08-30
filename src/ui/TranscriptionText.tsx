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
          style={{
            color: part.isReconstructed ? 'rgba(244, 230, 211, 0.4)' : 'rgba(244, 230, 211, 0.95)',
            fontWeight: part.isReconstructed ? 400 : 500,
          }}
        >
          {part.text}
        </span>
      ))}
    </span>
  )
}
