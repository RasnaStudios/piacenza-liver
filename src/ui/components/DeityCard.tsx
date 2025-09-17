import { Paper, Group, Title, Text } from '@mantine/core'
import { InscriptionChip } from './InscriptionChip'
import { getGodInscriptionData, getGodVariationInInscription } from '../../utils/liverUtils'

interface DeityCardProps {
  god: any
  onInscriptionClick?: (inscriptionId: number) => void
  selectedInscriptionId?: number
}

export function DeityCard({ god, onInscriptionClick, selectedInscriptionId }: DeityCardProps) {
  const godData = getGodInscriptionData(god.id)
  const { godInscriptions } = godData
  
  // Get the god's form from the selected inscription (if any) or first available inscription
  const godForm = selectedInscriptionId 
    ? getGodVariationInInscription(god.id, selectedInscriptionId)
    : godData.nameVariations[0]
  
  // Get the group color from the selected inscription or first available inscription
  const groupColor = selectedInscriptionId 
    ? godInscriptions.find(insc => insc.id === selectedInscriptionId)?.groupColor || '#8B6541'
    : godInscriptions[0]?.groupColor || '#8B6541'
  
  // Filter out the currently selected inscription
  const filteredInscriptions = godInscriptions.filter(inscription => 
    inscription.id !== selectedInscriptionId
  )

  return (
    <Paper
      p={{ base: 'sm', sm: 'md' }}
      radius="md"
      className="bg-overlay border-accent text-secondary shadow-secondary font-primary"
      style={{
        borderLeft: '4px solid var(--accent-bronze)',
        backdropFilter: 'blur(10px)',
        fontFamily: 'var(--font-primary)',
      }}
    >
      <Group justify="space-between" align="center" mb="sm" pb="xs" className="border-accent" style={{ borderBottom: '1px solid var(--border-accent)' }}>
        <Group gap="xs" align="baseline">
          <Title 
            order={1}
            className="text-bronze"
            size="xl"
            fw={400}
          >
            {god.name}
          </Title>
          {godForm && (
            <Text>
              <Text component="span" size="lg" mr="xs">as</Text>
              <Text 
                component="span"
                fw={700}
                style={{ 
                  color: groupColor,
                  textShadow: `0 0 8px ${groupColor}40, 0 1px 2px rgba(0, 0, 0, 0.8)`
                }}
              >
                {godForm.toUpperCase()}
              </Text>
            </Text>
          )}
        </Group>
      </Group>
      <Text className="font-primary" size="xl" fw={400}>
        {god.description}
      </Text>

        {/* Also appears in inscriptions */}
        {filteredInscriptions.length > 0 && (
          <div >
            <Title className="text-bronze" order={2} size="md" fw={600} tt="uppercase" my="sm">
              Also Appears in
            </Title>
            <Group gap="xs" style={{ display: 'flex', flexWrap: 'wrap' }}>
              {filteredInscriptions.map(inscription => (
                <InscriptionChip
                  key={inscription.id}
                  inscriptionId={inscription.id}
                  groupColor={inscription.groupColor}
                  associatedGodIds={inscription.otherGods}
                  godVariation={getGodVariationInInscription(god.id, inscription.id)}
                  onClick={() => onInscriptionClick?.(inscription.id)}
                />
              ))}
            </Group>
          </div>
        )}
    </Paper>
  )
}
