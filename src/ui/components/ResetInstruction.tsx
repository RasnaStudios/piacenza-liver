import { Box, Text, Transition } from "@mantine/core";
import { useEffect, useRef, useState } from "react";
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
	const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		// Clear any existing timers
		if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
		if (showTimerRef.current) clearTimeout(showTimerRef.current);

		if (hasViewChanged && !isPanelOpen) {
			// Wait 4 seconds before showing (user might still be moving)
			const timer = setTimeout(() => {
				setShowInstruction(true);
				// Auto-hide after some seconds
				const hideTimer = setTimeout(() => {
					setShowInstruction(false);
				}, 10000);
				hideTimerRef.current = hideTimer;
			}, 4000);
			showTimerRef.current = timer;
		} else {
			// Hide immediately if panel opens or view resets
			setShowInstruction(false);
		}

		// Cleanup timers on unmount
		return () => {
			if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
			if (showTimerRef.current) clearTimeout(showTimerRef.current);
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
