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
	}, [hasViewChanged, isPanelOpen, hideTimer, showTimer]);

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
						className="title-gradient title-subtle"
						style={{
							...styles,
						}}
					>
						{isMobile ? "Double tap to reset" : "Double-click to reset"}
					</Text>
				)}
			</Transition>
		</Box>
	);
}
