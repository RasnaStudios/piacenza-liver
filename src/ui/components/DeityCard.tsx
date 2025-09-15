import { Paper, Group, Title, Text, Stack } from '@mantine/core'
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
        <Title 
          order={1}
          className="text-bronze"
          size="xl"
          fw={400}
        >
          {god.name}
        </Title>
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
