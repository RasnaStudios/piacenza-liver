import {
	liverGods,
	liverGroups,
	liverInscriptions,
} from "../../scene/LiverData";

export function DataSummary() {
	const totalInscriptions = liverInscriptions.length;
	const totalGroups = Object.keys(liverGroups).length;
	const totalDeities = Object.keys(liverGods).length;

	// Group inscriptions by their cosmological zones based on ID ranges
	const getGroupForInscription = (id: number) => {
		if (id >= 1 && id <= 4) return "sky";
		if (id >= 5 && id <= 8) return "water";
		if (id >= 9 && id <= 12) return "earth";
		if (id >= 13 && id <= 16) return "underworld";
		if (id >= 17 && id <= 24) return "pars_familiaris";
		if (id >= 25 && id <= 28) return "gall_bladder";
		if (id >= 29 && id <= 30) return "central_section";
		if (id >= 31 && id <= 36) return "pars_hostilis";
		if (id >= 37 && id <= 40) return "central_section";
		if (id >= 41 && id <= 42) return "retro";
		return "unknown";
	};

	const inscriptionsByGroup = liverInscriptions.reduce(
		(acc, inscription) => {
			const group = getGroupForInscription(inscription.id);
			if (!acc[group]) acc[group] = [];
			acc[group].push(inscription);
			return acc;
		},
		{} as Record<string, typeof liverInscriptions>,
	);

	return (
		<div
			style={{
				position: "fixed",
				top: "10px",
				right: "10px",
				background: "rgba(0, 0, 0, 0.9)",
				color: "white",
				padding: "12px 16px",
				borderRadius: "8px",
				fontSize: "10px",
				fontFamily: "monospace",
				zIndex: -1,
				pointerEvents: "none",
				maxWidth: "400px",
				maxHeight: "90vh",
				overflowY: "auto",
			}}
		>
			<div
				style={{ marginBottom: "8px", fontWeight: "bold", fontSize: "12px" }}
			>
				Piacenza Liver Dataset - Complete Archaeological Data
			</div>

			<div style={{ marginBottom: "8px" }}>
				<strong>{totalInscriptions} Etruscan inscriptions</strong> across{" "}
				{totalGroups} cosmological zones
			</div>

			{/* All Inscriptions by Group */}
			<div style={{ marginBottom: "12px" }}>
				<div style={{ fontWeight: "bold", marginBottom: "4px" }}>
					Inscriptions by Zone:
				</div>
				{Object.entries(inscriptionsByGroup).map(([group, inscriptions]) => (
					<div key={group} style={{ marginBottom: "6px", marginLeft: "8px" }}>
						<div style={{ fontWeight: "bold" }}>
							{group.replace("_", " ")} ({inscriptions.length}):
						</div>
						{inscriptions.map((inscription) => (
							<div
								key={inscription.id}
								style={{
									marginLeft: "12px",
									fontSize: "9px",
									marginBottom: "2px",
								}}
							>
								#{inscription.id}: {inscription.etruscanText} →{" "}
								{inscription.transcription}
								{inscription.gods.map((god) => ` [${god.id}]`).join("")}
							</div>
						))}
					</div>
				))}
			</div>

			{/* All Deities */}
			<div style={{ marginBottom: "12px" }}>
				<div style={{ fontWeight: "bold", marginBottom: "4px" }}>
					All {totalDeities} Deities:
				</div>
				{Object.entries(liverGods).map(([id, deity]) => (
					<div
						key={id}
						style={{ marginLeft: "8px", fontSize: "9px", marginBottom: "2px" }}
					>
						{id}: {deity.name} (
						{"romanEquivalent" in deity ? deity.romanEquivalent : "N/A"})
					</div>
				))}
			</div>

			{/* Cosmological Groups */}
			<div style={{ marginBottom: "12px" }}>
				<div style={{ fontWeight: "bold", marginBottom: "4px" }}>
					Cosmological Zones:
				</div>
				{Object.entries(liverGroups).map(([id, group]) => (
					<div
						key={id}
						style={{ marginLeft: "8px", fontSize: "9px", marginBottom: "2px" }}
					>
						{id}: {group.name} - {group.description}
					</div>
				))}
			</div>

			<div
				style={{
					fontSize: "9px",
					opacity: 0.7,
					borderTop: "1px solid #333",
					paddingTop: "8px",
				}}
			>
				Created by Lorenzo Andraghetti (@andraghetti)
				<br />
				Interactive 3D Archaeological Reconstruction
				<br />
				Source: https://liver.rasna.dev/
			</div>
		</div>
	);
}
