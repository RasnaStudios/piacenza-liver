import { MantineProvider } from "@mantine/core";
import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import Scene from "./Scene";
import { TitleOverlay } from "./ui/components/TitleOverlay";
import { LoadingScreen } from "./ui/LoadingScreen";
import "@mantine/core/styles.css";

function App() {
	const [loadingProgress, setLoadingProgress] = useState(0);
	const [isLoading, setIsLoading] = useState(true);
	const [hasInteracted, setHasInteracted] = useState(false);

	return (
		<MantineProvider>
			<StrictMode>
				<Scene
					isLoading={isLoading}
					setIsLoading={setIsLoading}
					setLoadingProgress={setLoadingProgress}
					hasInteracted={hasInteracted}
					setHasInteracted={setHasInteracted}
				/>
				<TitleOverlay hasInteracted={hasInteracted} />
				<LoadingScreen progress={loadingProgress} isLoading={isLoading} />
			</StrictMode>
		</MantineProvider>
	);
}

const rootElement = document.getElementById("root");
if (!rootElement) {
	throw new Error("Root element not found");
}

createRoot(rootElement).render(<App />);
