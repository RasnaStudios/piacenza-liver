import { Box, Button, Modal, Stack, Text, Title } from "@mantine/core";

interface ControlsModalProps {
	opened: boolean;
	onClose: () => void;
	platform: string;
}

export function ControlsModal({
	opened,
	onClose,
	platform,
}: ControlsModalProps) {
	const getControlsData = () => {
		const modifier = platform === "mac" ? "⌘" : "Alt";
		const shift = "⇧";

		return [
			{
				command: "Mouse",
				description: "Rotate the 3D model around",
			},
			{
				command: `${modifier} + Mouse`,
				description: "Pan the camera view",
			},
			{
				command: "Scroll",
				description: "Zoom in and out",
			},
			{
				command: "Double-click",
				description: "Reset to default view",
			},
			{
				command: `${shift} + Drag`,
				description: "Move the model position",
			},
		];
	};

	const controls = getControlsData();

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			withCloseButton={false}
			title={
				<Box
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
					}}
				>
					<Title
						order={3}
						className="text-bronze"
						style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
					>
						🎮 Controls
					</Title>
					<Button
						variant="subtle"
						size="sm"
						onClick={onClose}
						style={{
							color: "var(--bronze-text)",
							backgroundColor: "transparent",
							border: "none",
							padding: "4px",
							minWidth: "auto",
							width: "32px",
							height: "32px",
							borderRadius: "50%",
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.backgroundColor =
								"var(--bg-overlay-secondary)";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.backgroundColor = "transparent";
						}}
					>
						✕
					</Button>
				</Box>
			}
			size="md"
			centered
			styles={{
				content: {
					backgroundColor: "var(--primary-bg)",
					border: "1px solid var(--border-primary)",
					borderRadius: "12px",
					boxShadow: "var(--shadow-primary)",
				},
				header: {
					backgroundColor: "var(--primary-bg)",
					borderBottom: "1px solid var(--border-secondary)",
					padding: "20px 24px 16px 24px",
				},
				body: {
					backgroundColor: "var(--primary-bg)",
					padding: "24px",
				},
			}}
		>
			<Stack gap="xs">
				{controls.map((control, index) => (
					<Box key={index}>
						<Box
							className="bg-overlay-secondary"
							p="xs"
							style={{
								borderRadius: "8px",
								border: "1px solid var(--border-secondary)",
								transition: "all 0.2s ease",
							}}
						>
							<Stack gap="xs">
								<Text
									size="lg"
									className="text-accent-gold"
									style={{
										fontFamily: "var(--font-display)",
										fontWeight: 600,
										letterSpacing: "0.5px",
										textTransform: "uppercase",
									}}
								>
									{control.command}
								</Text>
								<Text
									size="md"
									className="text-secondary"
									style={{
										fontFamily: "var(--font-primary)",
										lineHeight: 1.5,
										fontStyle: "italic",
									}}
								>
									{control.description}
								</Text>
							</Stack>
						</Box>
					</Box>
				))}
			</Stack>
		</Modal>
	);
}
