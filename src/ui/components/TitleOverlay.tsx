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
						ff="Cinzel, Playfair Display, Crimson Text, Times New Roman, serif"
						style={{
							...styles,
							fontSize: "clamp(28px, 4.5vw, 60px)",
							letterSpacing: "6px",
							background:
								"linear-gradient(45deg, #2c2c2c 0%, #6b6b6b 30%, #c9a876 60%, #2c2c2c 100%)",
							backgroundSize: "400% 200%",
							WebkitBackgroundClip: "text",
							WebkitTextFillColor: "transparent",
							backgroundClip: "text",
							filter:
								"drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.8)) drop-shadow(0 0 15px rgba(139, 101, 65, 0.3)) drop-shadow(0 0 30px rgba(201, 168, 118, 0.1))",
							WebkitTextStroke: "0.5px rgba(139, 101, 65, 0.2)",
							animation: "wavyGradient 30s ease-in-out infinite",
						}}
						className="title-responsive"
					>
						Piacenza Liver
					</Text>
				)}
			</Transition>
		</Box>
	);
}
