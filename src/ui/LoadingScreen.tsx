
import { 
  Paper, 
  Text, 
  Title, 
  Stack, 
  Box
} from '@mantine/core'

interface LoadingScreenProps {
  progress: number
  isLoading: boolean
}

export function LoadingScreen({ progress, isLoading }: LoadingScreenProps) {
  if (!isLoading) {
    return null
  }

  const containerStyles = {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 25%, #2a2a2a 50%, #3a3a3a 75%, #4a4a4a 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    opacity: 1,
    transition: 'opacity 0.5s ease-out',
  }

  const contentStyles = {
    textAlign: 'center' as const,
    maxWidth: 400,
    padding: 40,
    background: 'linear-gradient(135deg, rgba(20, 16, 12, 0.95) 0%, rgba(32, 26, 20, 0.95) 25%, rgba(44, 36, 28, 0.95) 50%, rgba(58, 48, 38, 0.95) 75%, rgba(70, 58, 46, 0.95) 100%)',
    border: '2px solid rgba(139, 101, 65, 0.4)',
    borderRadius: 16,
    backdropFilter: 'blur(20px) saturate(180%)',
    boxShadow: '0 16px 48px rgba(0, 0, 0, 0.8), 0 8px 24px rgba(139, 101, 65, 0.2), 0 2px 8px rgba(212, 175, 55, 0.1), inset 0 1px 2px rgba(255, 255, 255, 0.1), inset 0 -1px 2px rgba(0, 0, 0, 0.3)',
  }

  const titleStyles = {
    color: '#f4e6d3',
    fontSize: '2.5em',
    fontWeight: 700,
    margin: '0 0 16px 0',
    background: 'linear-gradient(135deg, #f4e6d3 0%, #e6d4b7 20%, #d4af37 40%, #f0d67c 60%, #e6d4b7 80%, #f4e6d3 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    textShadow: '0 4px 8px rgba(0, 0, 0, 0.8)',
    fontFamily: 'Cinzel, Times New Roman, serif',
    letterSpacing: '2px',
  }

  const subtitleStyles = {
    color: 'rgba(244, 230, 211, 0.8)',
    fontSize: '1.1em',
    margin: '0 0 32px 0',
    fontStyle: 'italic',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
    letterSpacing: '0.5px',
  }

  const progressContainerStyles = {
    marginBottom: 24,
  }

  const progressLabelStyles = {
    color: '#f4e6d3',
    fontSize: '0.9em',
    marginBottom: 8,
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
  }

  const progressBarStyles = {
    height: 8,
    borderRadius: 4,
    background: 'rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(139, 101, 65, 0.3)',
    overflow: 'hidden',
  }

  const progressFillStyles = {
    height: '100%',
    background: 'linear-gradient(90deg, #d4af37 0%, #f0d67c 50%, #d4af37 100%)',
    borderRadius: 4,
    transition: 'width 0.3s ease',
    width: `${progress}%`,
    boxShadow: '0 0 8px rgba(212, 175, 55, 0.4)',
  }

  const percentageStyles = {
    color: '#d4af37',
    fontSize: '1.2em',
    fontWeight: 600,
    marginTop: 8,
    textShadow: '0 1px 3px rgba(0, 0, 0, 0.8)',
  }

  const loadingTextStyles = {
    color: 'rgba(244, 230, 211, 0.7)',
    fontSize: '0.85em',
    fontStyle: 'italic',
    marginTop: 16,
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
  }

  return (
    <Box style={containerStyles}>
      <Paper style={contentStyles}>
        <Stack gap="lg">
          <Title order={1} style={titleStyles}>
            Piacenza Liver
          </Title>
          
          <Text style={subtitleStyles}>
            Ancient Etruscan Divination Artifact
          </Text>
          
          <Box style={progressContainerStyles}>
            <Text style={progressLabelStyles}>
              Loading 3D Model...
            </Text>
            
            <Box style={progressBarStyles}>
              <Box style={progressFillStyles} />
            </Box>
            
            <Text style={percentageStyles}>
              {Math.round(progress)}%
            </Text>
          </Box>
          
          <Text style={loadingTextStyles}>
            Please wait while we prepare the interactive experience
          </Text>
        </Stack>
      </Paper>
    </Box>
  )
} 