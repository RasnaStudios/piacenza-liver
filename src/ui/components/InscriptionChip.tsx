import { Button, Group, Text } from "@mantine/core";
import { type LiverGod, liverGods } from "../../scene/LiverData";
import { NumberBadge } from "./NumberBadge";

interface InscriptionChipProps {
	inscriptionId: number;
	groupColor: string;
	associatedGodIds: string[];
	onClick: () => void;
	godVariation?: string | null;
}

export function InscriptionChip({
	inscriptionId,
	groupColor,
	associatedGodIds,
	onClick,
	godVariation,
}: InscriptionChipProps) {
	const associatedGods = associatedGodIds
		.map((id) => (liverGods as Record<string, LiverGod>)[id])
		.filter(Boolean);

	return (
		<Button
			onClick={onClick}
			variant="light"
			radius="xl"
			className="font-primary text-secondary fancy-button"
			h="auto"
			py={5}
			pl={6}
			style={{
				background: `linear-gradient(135deg, ${groupColor}20 0%, ${groupColor}10 100%)`,
				border: `1px solid ${groupColor}40`,
				minHeight: "30px",
			}}
			onMouseEnter={(e) => {
				e.currentTarget.style.background = `linear-gradient(135deg, ${groupColor}40 0%, ${groupColor}25 100%)`;
				e.currentTarget.style.border = `1px solid ${groupColor}60`;
				e.currentTarget.style.boxShadow = `0 4px 16px ${groupColor}30, 0 2px 8px rgba(0, 0, 0, 0.2)`;
			}}
			onMouseLeave={(e) => {
				e.currentTarget.style.background = `linear-gradient(135deg, ${groupColor}20 0%, ${groupColor}10 100%)`;
				e.currentTarget.style.border = `1px solid ${groupColor}40`;
				e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.1)";
			}}
			title={`Go to inscription ${inscriptionId}${associatedGods.length > 0 ? ` (with ${associatedGods.map((g) => g.name).join(", ")})` : ""}`}
		>
			<Group gap="xs" wrap="nowrap">
				<NumberBadge value={inscriptionId} color={groupColor} />

				{godVariation && (
					<Text>
						<Text component="span" size="lg" style={{ color: "white" }}>
							as{" "}
						</Text>
						<Text
							component="span"
							fw={700}
							style={{
								color: groupColor,
								textShadow: `0 0 8px ${groupColor}40, 0 1px 2px rgba(0, 0, 0, 0.8)`,
							}}
						>
							{godVariation.toUpperCase()}
						</Text>
					</Text>
				)}

				{associatedGods.length > 0 && (
					<Text className="font-serif">
						<Text component="span" size="lg" style={{ color: "white" }}>
							with{" "}
						</Text>
						<Text
							component="span"
							size="md"
							fw={700}
							style={{
								color: groupColor,
								textShadow: `0 0 8px ${groupColor}40, 0 1px 2px rgba(0, 0, 0, 0.8)`,
							}}
						>
							{associatedGods.map((god) => god.name).join(", ")}
						</Text>
					</Text>
				)}
			</Group>
		</Button>
	);
}
