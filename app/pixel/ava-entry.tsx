import { createRoot } from "react-dom/client";

import { AvaLuPixel } from "./ava-lu-pixel";

const root = document.getElementById("root");
if (root !== null) createRoot(root).render(<AvaLuPixel duration={999999} />);
