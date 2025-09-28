import { Box, Group } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useEffect, useRef, useState } from 'react';
import { isMobile } from 'react-device-detect';
import { type Inscription, liverInscriptions } from '../scene/LiverData';
import { getGodsDisplayNames, getInscriptionGroup } from '../utils/liverUtils';
import { NumberBadge } from './components/NumberBadge';

interface InscriptionListProps {
  onInscriptionSelect: (inscription: Inscription) => void;
  selectedInscription: Inscription | null;
  isLoading: boolean;
  hasInteracted: boolean;
}

export function InscriptionList({
  onInscriptionSelect,
  selectedInscription,
  isLoading,
  hasInteracted,
}: InscriptionListProps) {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const inscriptionRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const isPortrait = useMediaQuery('(orientation: portrait)');

  const getGroupColor = (inscriptionId: number) => {
    const group = getInscriptionGroup(inscriptionId);
    return group?.color || '#888';
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      // Only show on desktop landscape - hide completely in portrait
      const shouldShow =
        hasInteracted && !isLoading && !isPortrait && !isMobile;
      setIsVisible(shouldShow);
    }, 500);

    return () => clearTimeout(timer);
  }, [hasInteracted, isLoading, isPortrait]);

  // Auto-scroll to selected inscription
  useEffect(() => {
    if (
      selectedInscription &&
      inscriptionRefs.current[selectedInscription.id]
    ) {
      const element = inscriptionRefs.current[selectedInscription.id];
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }
  }, [selectedInscription]);

  // Hide in portrait mode completely
  const shouldHide = isLoading || !hasInteracted || !isVisible || isPortrait;

  if (shouldHide) {
    return null;
  }

  const renderInscription = (inscription: Inscription) => {
    const isHovered = hoveredId === inscription.id;
    const isSelected = selectedInscription?.id === inscription.id;

    return (
      <Box
        key={inscription.id}
        ref={(el: HTMLDivElement | null) => {
          inscriptionRefs.current[inscription.id] = el;
        }}
        className="inscription-item"
        style={{
          background: isSelected
            ? `${getGroupColor(inscription.id)}70`
            : isHovered
              ? `${getGroupColor(inscription.id)}50`
              : 'transparent',
        }}
        onMouseEnter={() => setHoveredId(inscription.id)}
        onMouseLeave={() => setHoveredId(null)}
        onClick={() => onInscriptionSelect(inscription)}
      >
        <Group align="center" gap="xs">
          <NumberBadge value={inscription.id} />
          <Box
            className="text-bronze-light font-primary"
            style={{
              fontSize: '16px',
              fontFamily:
                "'Inter', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
              textShadow: '0px 1px 5px rgba(205, 127, 50, 0.3)',
            }}
          >
            {getGodsDisplayNames(inscription.gods)}
          </Box>
        </Group>
      </Box>
    );
  };

  return (
    <Box
      className="inscription-list-container panel-border"
      style={{
        left: isVisible ? 0 : -1000,
      }}
    >
      <Box
        className="scrollbar"
        style={{
          flex: 1,
          overflowY: 'scroll',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
          pointerEvents: 'auto',
        }}
        onWheel={(e) => {
          e.stopPropagation();
        }}
      >
        {liverInscriptions.map(renderInscription)}
      </Box>
    </Box>
  );
}
