import { Box, Drawer, Paper, Stack, Title } from "@mantine/core";
import { useRef, useState } from "react";
import { isMobile } from "react-device-detect";
import {
	type Inscription,
	type LiverGod,
	liverGods,
	liverInscriptions,
} from "../scene/LiverData";
import { getGodsDisplayNames } from "../utils/liverUtils";
import { DeityCard } from "./components/DeityCard";
import { GroupSection } from "./components/GroupSection";
import { PanelHeader } from "./components/PanelHeader";
import { PanelLegend } from "./components/PanelLegend";

interface DeityPanelProps {
	selectedInscription: Inscription | null;
	onClose: () => void;
	onInscriptionSelect?: (inscription: Inscription) => void;
}

export function DeityPanel({
	selectedInscription,
	onClose,
	onInscriptionSelect,
}: DeityPanelProps) {
	const isPortrait = window.matchMedia("(orientation: portrait)").matches;
	const [panelHeight, setPanelHeight] = useState(33); // Start at 33vh
	const [isDragging, setIsDragging] = useState(false);
	const [dragOffset, setDragOffset] = useState(0);
	const dragStartY = useRef(0);
	const prevInscriptionId = useRef<number | null>(null);

	// Reset to lower third when new inscription is selected
	if (
		selectedInscription &&
		selectedInscription.id !== prevInscriptionId.current
	) {
		setPanelHeight(33);
		prevInscriptionId.current = selectedInscription.id;
	}

	if (!selectedInscription) return null;

	// Get display names for the gods in this inscription
	const deityNames = getGodsDisplayNames(selectedInscription.gods || []);

	// Get god objects for DeityCard components
	const gods = (selectedInscription.gods || [])
		.map((god) => {
			const godId = typeof god === "string" ? god : god.id;
			return (liverGods as Record<string, LiverGod>)[godId];
		})
		.filter(Boolean);

	const handleDragStart = (e: React.TouchEvent) => {
		// Only start dragging if touch is in the header area (not scrollable content)
		const target = e.target as HTMLElement;
		const isInScrollableArea = target.closest(".scrollbar");

		if (!isInScrollableArea) {
			setIsDragging(true);
			dragStartY.current = e.touches[0].clientY;
			e.stopPropagation();
		}
	};

	const handleDragMove = (e: React.TouchEvent) => {
		if (!isDragging) return;
		const currentY = e.touches[0].clientY;
		const deltaY = currentY - dragStartY.current;
		setDragOffset(deltaY);
		e.stopPropagation();
	};

	const handleDragEnd = (e: React.TouchEvent) => {
		if (!isDragging) return;
		setIsDragging(false);

		// Calculate actual panel position relative to viewport bottom
		const viewportHeight = window.innerHeight;
		const currentPanelHeight = (panelHeight / 100) * viewportHeight;
		const panelBottomPosition = dragOffset; // How far panel moved from bottom

		// Only close if dragged down more than the current panel height
		if (panelBottomPosition > currentPanelHeight) {
			onClose();
		} else {
			// Save the new position based on drag direction
			if (dragOffset < 0) {
				// Dragged up - expand panel
				const dragUpDistance = Math.abs(dragOffset);
				const heightIncrease = (dragUpDistance / viewportHeight) * 100; // Convert to vh
				setPanelHeight(
					Math.min(90, Math.max(33, panelHeight + heightIncrease)),
				);
			} else if (dragOffset > 0) {
				// Dragged down - contract panel
				const dragDownDistance = dragOffset;
				const heightDecrease = (dragDownDistance / viewportHeight) * 100; // Convert to vh
				setPanelHeight(
					Math.min(90, Math.max(33, panelHeight - heightDecrease)),
				);
			}
		}

		setDragOffset(0);
		e.stopPropagation();
	};

	const getCurrentHeight = () => {
		if (isDragging) {
			const viewportHeight = window.innerHeight;
			if (dragOffset > 0) {
				// When dragging down, show live height decrease
				const dragDownDistance = dragOffset;
				const heightDecrease = (dragDownDistance / viewportHeight) * 100;
				return Math.min(90, Math.max(33, panelHeight - heightDecrease));
			} else if (dragOffset < 0) {
				// When dragging up, show live height increase
				const dragUpDistance = Math.abs(dragOffset);
				const heightIncrease = (dragUpDistance / viewportHeight) * 100;
				return Math.min(90, Math.max(33, panelHeight + heightIncrease));
			}
		}
		return panelHeight;
	};

	// Mobile portrait: custom bottom sheet
	if (isMobile && isPortrait) {
		return (
			<Paper
				className="bg-primary text-primary"
				style={{
					position: "fixed",
					bottom: 0,
					left: 0,
					right: 0,
					height: `${getCurrentHeight()}vh`,
					borderRadius: "16px 16px 0 0",
					boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.3)",
					zIndex: 100,
					transition: isDragging ? "none" : "all 0.3s ease-out",
				}}
			>
				{/* Drag handle */}
				<Box
					className="drag-handle"
					style={{
						cursor: "grab",
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						padding: "8px 0 4px 0",
						touchAction: "none",
					}}
					onTouchStart={handleDragStart}
					onTouchMove={handleDragMove}
					onTouchEnd={handleDragEnd}
				>
					<Box
						style={{
							width: "40px",
							height: "4px",
							backgroundColor: "rgba(196, 168, 118, 0.7)",
							borderRadius: "2px",
						}}
					/>
				</Box>

				<Box
					style={{
						flex: 1,
						overflow: "hidden",
						display: "flex",
						flexDirection: "column",
						height: "100%",
					}}
				>
					<Box
						onTouchStart={handleDragStart}
						onTouchMove={handleDragMove}
						onTouchEnd={handleDragEnd}
						style={{
							cursor: "grab",
							touchAction: "none",
							flexShrink: 0,
						}}
					>
						<PanelHeader
							selectedInscription={selectedInscription}
							deityNames={deityNames}
							onClose={onClose}
						/>
					</Box>

					<Box
						className="scrollbar"
						style={{
							flex: 1,
							overflowY: "auto",
							overflowX: "hidden",
							WebkitOverflowScrolling: "touch",
							minHeight: 0,
							touchAction: "pan-y",
						}}
						p="md"
						onTouchStart={(e) => e.stopPropagation()}
					>
						<Stack gap="lg">
							<Box>
								<Title
									order={3}
									my="sm"
									ml="sm"
									fw={400}
									className="text-bronze"
								>
									Involved deities
								</Title>

								<Stack gap="md">
									{gods.map((god: LiverGod) => (
										<DeityCard
											key={god.id}
											god={god}
											selectedInscriptionId={selectedInscription.id}
											onInscriptionClick={(inscriptionId) => {
												const inscription = liverInscriptions.find(
													(ins: Inscription) => ins.id === inscriptionId,
												);
												if (inscription && onInscriptionSelect) {
													setPanelHeight(33);
													setTimeout(() => {
														onInscriptionSelect(inscription);
													}, 300);
												}
											}}
										/>
									))}
								</Stack>
							</Box>

							<GroupSection selectedInscription={selectedInscription} />

							<PanelLegend />
						</Stack>
					</Box>
				</Box>
			</Paper>
		);
	}

	// Desktop/landscape: right side panel
	return (
		<Drawer
			opened={!!selectedInscription}
			onClose={onClose}
			position="right"
			size="45vw"
			withOverlay={false}
			withCloseButton={false}
			className="panel-border"
			styles={{
				content: {
					position: "fixed",
					top: 0,
					right: 0,
					bottom: 0,
					width: "min(45vw, 600px)",
					maxWidth: "600px",
					height: "100vh",
					background: "var(--primary-bg)",
					color: "var(--primary-text)",
					fontFamily: "var(--font-primary)",
					boxShadow: "var(--shadow-primary)",
					animation: "panelSlideIn 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)",
				},
				body: {
					padding: 0,
					height: "100%",
					display: "flex",
					flexDirection: "column",
					backgroundColor: "var(--primary-bg)",
				},
			}}
			transitionProps={{
				transition: "slide-left",
				duration: 400,
			}}
		>
			<PanelHeader
				selectedInscription={selectedInscription}
				deityNames={deityNames}
				onClose={onClose}
			/>
			<Box
				className="scrollbar"
				style={{
					flex: 1,
					overflowY: "scroll",
					overflowX: "hidden",
					minHeight: 0,
				}}
				p="xl"
			>
				<Stack gap="lg">
					<Box>
						<Title order={3} mb="sm" ml="sm" fw={400} className="text-bronze">
							Involved deities
						</Title>

						<Stack gap="md">
							{gods.map((god: LiverGod) => (
								<DeityCard
									key={god.id}
									god={god}
									selectedInscriptionId={selectedInscription.id}
									onInscriptionClick={(inscriptionId) => {
										const inscription = liverInscriptions.find(
											(ins: Inscription) => ins.id === inscriptionId,
										);
										if (inscription && onInscriptionSelect) {
											onInscriptionSelect(inscription);
										}
									}}
								/>
							))}
						</Stack>
					</Box>

					<GroupSection selectedInscription={selectedInscription} />

					<PanelLegend />
				</Stack>
			</Box>
		</Drawer>
	);
}
