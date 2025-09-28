import { Group, Paper, Text, Title } from "@mantine/core";
import type { Inscription } from "../../scene/LiverData";
import { getInscriptionGroup } from "../../utils/liverUtils";

interface GroupSectionProps {
	selectedInscription: Inscription | null;
}

export function GroupSection({ selectedInscription }: GroupSectionProps) {
	if (!selectedInscription) return null;

	const group = getInscriptionGroup(selectedInscription.id);

	if (!group) {
		return null;
	}

	return (
		<Paper
			p={{ base: "md", sm: "lg" }}
			radius="md"
			style={{
				border: "1px solid var(--border-secondary)",
				backgroundColor: `${group.color}10`,
			}}
		>
			<Group gap={16} mb="sm">
				<div
					style={{
						width: 16,
						height: 16,
						borderRadius: "50%",
						border: "1px solid rgba(255, 255, 255, 0.3)",
						boxShadow: "0 1px 3px rgba(0, 0, 0, 0.3)",
						backgroundColor: group.color,
					}}
				/>
				<Title order={3} className="text-bronze">
					{group.name}
				</Title>
			</Group>

			<Text
				className="font-primary"
				size="xl"
				fw={400}
				style={{
					fontFamily:
						"'Inter', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
				}}
			>
				{group.description}
			</Text>
		</Paper>
	);
}
