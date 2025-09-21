#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

// Read the LiverData.ts file
const liverDataPath = path.join(__dirname, "../src/scene/LiverData.ts");
const liverDataContent = fs.readFileSync(liverDataPath, "utf8");

// Find the start and end of the liverInscriptions array
const startPattern = "export const liverInscriptions = [";
const startIndex = liverDataContent.indexOf(startPattern);
if (startIndex === -1) {
	console.error("❌ Failed to find liverInscriptions array in LiverData.ts");
	process.exit(1);
}

// Find the matching closing bracket
let bracketCount = 0;
let endIndex = startIndex + startPattern.length;
let foundEnd = false;

for (
	let i = startIndex + startPattern.length;
	i < liverDataContent.length;
	i++
) {
	if (liverDataContent[i] === "[") {
		bracketCount++;
	} else if (liverDataContent[i] === "]") {
		if (bracketCount === 0) {
			endIndex = i;
			foundEnd = true;
			break;
		}
		bracketCount--;
	}
}

if (!foundEnd) {
	console.error("❌ Failed to find end of liverInscriptions array");
	process.exit(1);
}

// Extract the array content
const arrayContent = liverDataContent.substring(
	startIndex + startPattern.length,
	endIndex,
);

// Parse the TypeScript array and convert to JSON
try {
	// Replace THREE.Vector3 constructors with simple objects
	const cleanArrayContent = arrayContent.replace(
		/new THREE\.Vector3\(([^)]+)\)/g,
		(_match, coords) => {
			const [x, y, z] = coords.split(",").map((c) => parseFloat(c.trim()));
			return JSON.stringify({ x, y, z });
		},
	);

	// Wrap in array brackets and parse safely
	const inscriptionsArray = JSON.parse(`[${cleanArrayContent}]`);

	// Transform to clean JSON format
	const cleanInscriptions = inscriptionsArray.map((inscription) => ({
		id: inscription.id,
		etruscanText: inscription.etruscanText,
		transcription: inscription.transcription,
		gods: inscription.gods.map((god) => ({ id: god.id, form: god.form })),
		group: getGroupForInscription(inscription.id),
	}));

	// Create the output data
	const outputData = {
		metadata: {
			title: "Piacenza Liver Inscriptions",
			description:
				"All 42 Etruscan inscriptions from the Piacenza Liver with translations and deity associations",
			creator: "Lorenzo Andraghetti",
			datePublished: new Date().toISOString().split("T")[0],
			source: "https://liver.rasna.dev/",
			totalInscriptions: cleanInscriptions.length,
		},
		inscriptions: cleanInscriptions,
	};

	// Ensure public/data directory exists
	const dataDir = path.join(__dirname, "../public/data");
	if (!fs.existsSync(dataDir)) {
		fs.mkdirSync(dataDir, { recursive: true });
	}

	// Write the JSON file
	const outputPath = path.join(dataDir, "inscriptions.json");
	fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));

	console.log(
		`✅ Successfully extracted ${cleanInscriptions.length} inscriptions to ${outputPath}`,
	);

	// Validate the output
	if (cleanInscriptions.length !== 42) {
		console.error(
			`❌ Expected 42 inscriptions, got ${cleanInscriptions.length}`,
		);
		process.exit(1);
	}
} catch (error) {
	console.error("❌ Failed to parse inscriptions:", error.message);
	process.exit(1);
}

// Helper function to determine group based on inscription ID
function getGroupForInscription(id) {
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
}
