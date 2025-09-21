import { Anchor, Box, Button, Divider, Stack, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import { isMobile } from "react-device-detect";
import { FaGithub, FaInstagram, FaLinkedin } from "react-icons/fa";
import { SiArtstation } from "react-icons/si";
import { ControlsModal } from "./ControlsModal";

export function PanelLegend() {
	const [platform, setPlatform] = useState("mac");
	const [controlsOpened, setControlsOpened] = useState(false);

	useEffect(() => {
		// Detect platform
		const userAgent = navigator.userAgent.toLowerCase();
		if (userAgent.includes("mac")) {
			setPlatform("mac");
		} else if (userAgent.includes("win")) {
			setPlatform("windows");
		} else {
			setPlatform("linux");
		}
	}, []);

	return (
		<Box p="md">
			<Stack gap="md">
				{/* Controls Section */}
				{!isMobile ? (
					<Box style={{ textAlign: "center" }}>
						<Button
							variant="filled"
							size="md"
							onClick={() => setControlsOpened(true)}
							className="text-primary fancy-button"
							style={{
								backgroundColor: "var(--primary-bg)",
								border: "1px solid var(--accent-bronze)",
								borderRadius: "24px",
								fontFamily: "var(--font-display)",
								fontSize: "16px",
								fontWeight: 600,
								textTransform: "uppercase",
								letterSpacing: "1px",
								padding: "12px 24px",
								boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
								transition: "all 0.2s ease",
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.backgroundColor = "var(--accent-gold)";
								e.currentTarget.style.color = "var(--primary-bg)";
								e.currentTarget.style.transform = "translateY(-2px)";
								e.currentTarget.style.boxShadow =
									"0 6px 16px rgba(0, 0, 0, 0.4)";
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.backgroundColor = "var(--accent-bronze)";
								e.currentTarget.style.color = "var(--primary-text)";
								e.currentTarget.style.transform = "translateY(0)";
								e.currentTarget.style.boxShadow =
									"0 4px 12px rgba(0, 0, 0, 0.3)";
							}}
						>
							🎮 Controls
						</Button>
					</Box>
				) : (
					<Text
						size="lg"
						className="text-tertiary"
						style={{
							fontFamily: "var(--font-primary)",
							textAlign: "center",
						}}
					>
						Double tap on the model to reset the view
					</Text>
				)}

				<Divider color="var(--border-secondary)" />

				{/* Credits Section */}
				<Stack gap="lg" style={{ textAlign: "center" }}>
					<Text size="lg" className="text-bronze" tt="uppercase">
						Created by
					</Text>

					{/* Team Members - Side by Side */}
					<Box
						style={{
							display: "flex",
							justifyContent: "space-around",
							gap: "32px",
						}}
					>
						<Box style={{ textAlign: "center" }}>
							<Text
								size="xl"
								className="text-secondary"
								style={{
									fontFamily: "var(--font-primary)",
									marginBottom: "8px",
									fontWeight: 600,
								}}
							>
								Lorenzo Andraghetti
							</Text>
							<Text
								size="lg"
								className="text-tertiary"
								style={{ fontStyle: "italic", marginBottom: "12px" }}
							>
								Developer
							</Text>
							<Box
								style={{
									display: "flex",
									justifyContent: "center",
									gap: "12px",
								}}
							>
								<Anchor
									href="https://linkedin.com/in/andraghetti"
									target="_blank"
									rel="noopener noreferrer"
								>
									<FaLinkedin size={30} color="var(--bronze-text)" />
								</Anchor>
								<Anchor
									href="https://github.com/andraghetti"
									target="_blank"
									rel="noopener noreferrer"
								>
									<FaGithub size={30} color="var(--bronze-text)" />
								</Anchor>
							</Box>
						</Box>

						<Box style={{ textAlign: "center" }}>
							<Text
								size="xl"
								className="text-secondary"
								style={{
									fontFamily: "var(--font-primary)",
									marginBottom: "8px",
									fontWeight: 600,
								}}
							>
								Luca Tampieri
							</Text>
							<Text
								size="lg"
								className="text-tertiary"
								mb="12px"
								style={{ fontStyle: "italic" }}
							>
								3D Artist
							</Text>
							<Box
								style={{
									display: "flex",
									justifyContent: "center",
									gap: "12px",
								}}
							>
								<Anchor
									href="https://linkedin.com/in/luca-tampieri"
									target="_blank"
									rel="noopener noreferrer"
								>
									<FaLinkedin size={30} color="var(--bronze-text)" />
								</Anchor>
								<Anchor
									href="https://www.artstation.com/lukedt"
									target="_blank"
									rel="noopener noreferrer"
								>
									<SiArtstation size={30} color="var(--bronze-text)" />
								</Anchor>
								<Anchor
									href="https://www.instagram.com/heythereluke/"
									target="_blank"
									rel="noopener noreferrer"
								>
									<FaInstagram size={30} color="var(--bronze-text)" />
								</Anchor>
							</Box>
						</Box>
					</Box>

					{/* Studio Links */}
					<Box
						mt="16px"
						display="flex"
						style={{
							justifyContent: "center",
							alignItems: "center",
							gap: "24px",
						}}
					>
						<Anchor
							href="https://github.com/rasnastudios/piacenza-liver"
							target="_blank"
							rel="noopener noreferrer"
							style={{
								color: "var(--bronze-text)",
								fontSize: "20px",
								fontWeight: 500,
								display: "flex",
								alignItems: "center",
								gap: "8px",
							}}
						>
							Contribute <FaGithub size={30} />
						</Anchor>
					</Box>
				</Stack>
			</Stack>

			{/* Desktop Controls Modal */}
			{!isMobile && (
				<ControlsModal
					opened={controlsOpened}
					onClose={() => setControlsOpened(false)}
					platform={platform}
				/>
			)}
		</Box>
	);
}
