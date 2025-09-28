import { Box, Text, Transition } from "@mantine/core";
import { useEffect, useState } from "react";

interface TitleOverlayProps {
	hasInteracted: boolean;
}

export function TitleOverlay({ hasInteracted }: TitleOverlayProps) {
	const [isVisible, setIsVisible] = useState(true); // Show immediately
	const [shouldRender, setShouldRender] = useState(true); // Show by default

	useEffect(() => {
		if (hasInteracted && shouldRender) {
			// User interacted - fade out
			setIsVisible(false);
			// Remove from DOM after animation completes
			setTimeout(() => setShouldRender(false), 800);
		} else if (!hasInteracted && !shouldRender) {
			// User reset - bring back the title
			setShouldRender(true);
			setIsVisible(true);
		}
	}, [hasInteracted, shouldRender]);

	if (!shouldRender) {
		return null;
	}

	return (
		<Box
			pos="fixed"
			top="8%"
			left="50%"
			style={{
				transform: "translateX(-50%)",
				zIndex: 1000,
				pointerEvents: "none",
			}}
		>
			<Transition
				mounted={isVisible}
				transition="fade"
				duration={800}
				timingFunction="ease-out"
			>
				{(styles: React.CSSProperties) => (
					<Text
						fw={100}
						ta="center"
						ff="Cinzel"
						className="title-gradient title-main"
						style={{
							...styles,
						}}
					>
						Piacenza Liver
					</Text>
				)}
			</Transition>
		</Box>
	);
}
