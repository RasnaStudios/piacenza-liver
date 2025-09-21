import { Group, Paper, Text, Title } from "@mantine/core";
import { getInscriptionGroup } from "../../utils/liverUtils";

interface GroupSectionProps {
	selectedInscription: any;
}

export function GroupSection({ selectedInscription }: GroupSectionProps) {
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

			<Text className="font-primary" size="xl" fw={400}>
				{group.description}
			</Text>
		</Paper>
	);
}
