#!/usr/bin/env tsx

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import * as ts from "typescript";
import { getInscriptionGroup } from "../src/utils/liverUtils.js";

// Type definitions
interface ParsedInscription {
	id?: number;
	etruscanText?: string;
	transcription?: string;
	gods?: ParsedGod[];
	position?: { x: number; y: number; z: number };
}

interface ParsedGod {
	id?: number;
	form?: string;
}

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Parse the TypeScript array using TypeScript compiler API
try {
	// Create a source file from the array content
	const sourceFile = ts.createSourceFile(
		"temp.ts",
		`const temp = [${arrayContent}];`,
		ts.ScriptTarget.Latest,
		true,
	);

	// Find the array literal expression
	let arrayExpression: ts.ArrayLiteralExpression | null = null;

	function visit(node: ts.Node) {
		if (ts.isArrayLiteralExpression(node)) {
			arrayExpression = node;
			return;
		}
		ts.forEachChild(node, visit);
	}

	visit(sourceFile);

	if (!arrayExpression) {
		throw new Error("Could not find array literal expression");
	}

	// Extract inscription data from the AST
	const inscriptionsArray = arrayExpression.elements.map((element) => {
		if (!ts.isObjectLiteralExpression(element)) {
			throw new Error("Expected object literal expression");
		}

		const inscription: ParsedInscription = {};

		element.properties.forEach((prop) => {
			if (!ts.isPropertyAssignment(prop) || !ts.isIdentifier(prop.name)) {
				return;
			}

			const propName = prop.name.text;

			switch (propName) {
				case "id":
					if (ts.isNumericLiteral(prop.initializer)) {
						inscription.id = parseInt(prop.initializer.text, 10);
					}
					break;

				case "etruscanText":
				case "transcription":
					if (ts.isStringLiteral(prop.initializer)) {
						inscription[propName] = prop.initializer.text;
					}
					break;

				case "gods":
					if (ts.isArrayLiteralExpression(prop.initializer)) {
						inscription.gods = prop.initializer.elements.map((godElement) => {
							if (!ts.isObjectLiteralExpression(godElement)) {
								return { id: 0, form: "" };
							}

							const god: ParsedGod = {};
							godElement.properties.forEach((godProp) => {
								if (
									!ts.isPropertyAssignment(godProp) ||
									!ts.isIdentifier(godProp.name)
								) {
									return;
								}

								const godPropName = godProp.name.text;
								if (
									godPropName === "id" &&
									ts.isNumericLiteral(godProp.initializer)
								) {
									god.id = parseInt(godProp.initializer.text, 10);
								} else if (
									godPropName === "form" &&
									ts.isStringLiteral(godProp.initializer)
								) {
									god.form = godProp.initializer.text;
								}
							});

							return god;
						});
					}
					break;

				case "position":
					if (
						ts.isNewExpression(prop.initializer) &&
						ts.isPropertyAccessExpression(prop.initializer.expression) &&
						ts.isIdentifier(prop.initializer.expression.expression) &&
						prop.initializer.expression.expression.text === "THREE" &&
						ts.isIdentifier(prop.initializer.expression.name) &&
						prop.initializer.expression.name.text === "Vector3" &&
						ts.isCallExpression(prop.initializer) &&
						prop.initializer.arguments.length === 3
					) {
						const args = prop.initializer.arguments;
						inscription.position = {
							x: ts.isNumericLiteral(args[0]) ? parseFloat(args[0].text) : 0,
							y: ts.isNumericLiteral(args[1]) ? parseFloat(args[1].text) : 0,
							z: ts.isNumericLiteral(args[2]) ? parseFloat(args[2].text) : 0,
						};
					}
					break;
			}
		});

		return inscription;
	});

	// Transform to clean JSON format
	const cleanInscriptions = inscriptionsArray.map((inscription) => ({
		id: inscription.id || 0,
		etruscanText: inscription.etruscanText || "",
		transcription: inscription.transcription || "",
		gods: (inscription.gods || []).map((god: ParsedGod) => ({
			id: god.id || 0,
			form: god.form || "",
		})),
		group: getInscriptionGroup(inscription.id || 0)?.name || "unknown",
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
	console.error("❌ Failed to parse inscriptions:", (error as Error).message);
	process.exit(1);
}
