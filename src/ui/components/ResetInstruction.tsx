import { Box, Text, Transition } from "@mantine/core";
import { useEffect, useState } from "react";
import { isMobile } from "react-device-detect";

interface ResetInstructionProps {
	isPanelOpen: boolean;
	hasViewChanged: boolean;
}

export function ResetInstruction({
	isPanelOpen,
	hasViewChanged,
}: ResetInstructionProps) {
	const [showInstruction, setShowInstruction] = useState(false);
	const [hideTimer, setHideTimer] = useState<number | null>(null);
	const [showTimer, setShowTimer] = useState<number | null>(null);

	useEffect(() => {
		// Clear any existing timers
		if (hideTimer) clearTimeout(hideTimer);
		if (showTimer) clearTimeout(showTimer);

		if (hasViewChanged && !isPanelOpen) {
			// Wait 2 seconds before showing (user might still be moving)
			const timer = setTimeout(() => {
				setShowInstruction(true);
				setHideTimer(hideTimer);
			}, 4000);
			setShowTimer(timer);
		} else {
			// Hide immediately if panel opens or view resets
			setShowInstruction(false);
		}

		// Cleanup timers on unmount
		return () => {
			if (hideTimer) clearTimeout(hideTimer);
			if (showTimer) clearTimeout(showTimer);
		};
	}, [hasViewChanged, isPanelOpen]);

	const shouldShow = showInstruction;

	return (
		<Box
			pos="fixed"
			bottom="6%"
			left="50%"
			style={{
				transform: "translateX(-50%)",
				zIndex: 1000,
				pointerEvents: "none",
				opacity: 0.6,
			}}
		>
			<Transition
				mounted={shouldShow}
				transition="fade"
				duration={800}
				timingFunction="ease-out"
			>
				{(styles: React.CSSProperties) => (
					<Text
						fw={200}
						ta="center"
						ff="Cinzel"
						style={{
							...styles,
							fontSize: "clamp(10px, 1.2vw, 16px)",
							letterSpacing: "1px",
							background:
								"linear-gradient(45deg, #2c2c2c 0%, #6b6b6b 30%, #c9a876 60%, #2c2c2c 100%)",
							backgroundSize: "400% 200%",
							WebkitBackgroundClip: "text",
							WebkitTextFillColor: "transparent",
							backgroundClip: "text",
							filter:
								"drop-shadow(0.5px 0.5px 1px rgba(0, 0, 0, 0.4)) drop-shadow(0 0 4px rgba(139, 101, 65, 0.15)) drop-shadow(0 0 8px rgba(201, 168, 118, 0.08))",
							WebkitTextStroke: "0.2px rgba(139, 101, 65, 0.15)",
							animation: "wavyGradient 30s ease-in-out infinite",
						}}
					>
						{isMobile ? "Double tap to reset" : "Double-click to reset"}
					</Text>
				)}
			</Transition>
		</Box>
	);
}
