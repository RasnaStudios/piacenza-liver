import { Badge } from "@mantine/core";
import { type Inscription, liverInscriptions } from "../../scene/LiverData";
import { getInscriptionGroup } from "../../utils/liverUtils";

interface NumberBadgeProps {
	value: number | string;
	color?: string;
	size?: number; // diameter in px; default 28 to match tooltip
}

export function NumberBadge({ value, color, size = 28 }: NumberBadgeProps) {
	const dimension = typeof size === "number" ? `${size}px` : size;
	const fontSize = Math.max(16, Math.round((Number(size) || 28) * 0.5));

	// Resolve color from data if not provided
	let resolvedColor = color;
	if (!resolvedColor) {
		const numericId =
			typeof value === "number" ? value : parseInt(String(value), 10);
		if (!Number.isNaN(numericId)) {
			const ins = (liverInscriptions as Inscription[]).find(
				(i: Inscription) => i.id === numericId,
			);
			if (ins) {
				const group = getInscriptionGroup(ins.id);
				resolvedColor = group?.color || resolvedColor;
			}
		}
	}

	// Calculate text color based on background brightness
	const getTextColor = (bgColor: string) => {
		if (!bgColor) return "var(--bronze-dark)";

		// Convert hex to RGB
		const hex = bgColor.replace("#", "");
		const r = parseInt(hex.substr(0, 2), 16);
		const g = parseInt(hex.substr(2, 2), 16);
		const b = parseInt(hex.substr(4, 2), 16);

		// Calculate luminance
		const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

		// Return bronze-dark for light backgrounds, bronze-light for dark backgrounds
		return luminance > 0.5 ? "var(--bronze-dark)" : "var(--bronze-light)";
	};

	const textColor = getTextColor(resolvedColor || "#ccc");

	// Create darker border color from background
	const getBorderColor = (bgColor: string) => {
		if (!bgColor) return "rgba(0, 0, 0, 0.3)";

		// Convert hex to RGB
		const hex = bgColor.replace("#", "");
		const r = parseInt(hex.substr(0, 2), 16);
		const g = parseInt(hex.substr(2, 2), 16);
		const b = parseInt(hex.substr(4, 2), 16);

		// Darken by reducing RGB values by 30%
		const darkR = Math.max(0, Math.round(r * 0.7));
		const darkG = Math.max(0, Math.round(g * 0.7));
		const darkB = Math.max(0, Math.round(b * 0.7));

		return `rgba(${darkR}, ${darkG}, ${darkB}, 0.8)`;
	};

	const borderColor = getBorderColor(resolvedColor || "#ccc");

	return (
		<Badge
			size="sm"
			variant="filled"
			style={{
				backgroundColor: resolvedColor || "#ccc",
				color: textColor,
				border: `2px solid ${borderColor}`,
				boxShadow: "var(--shadow-secondary)",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				minWidth: dimension,
				width: dimension,
				height: dimension,
				borderRadius: "50%",
				fontSize: `${fontSize}px`,
				fontFamily:
					'"Inter", "SF Pro Display", "Segoe UI", "Roboto", sans-serif',
				fontWeight: 600,
				textShadow:
					textColor === "var(--bronze-dark)"
						? "0 1px 2px rgba(255, 255, 255, 0.2)"
						: "0 1px 2px rgba(0, 0, 0, 0.4)",
				padding: 0,
				lineHeight: 1,
				boxSizing: "border-box",
				flexShrink: 0,
				letterSpacing: "-0.01em",
			}}
		>
			{value}
		</Badge>
	);
}
