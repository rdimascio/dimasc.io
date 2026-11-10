import { createRoot } from "react-dom/client";

import { RhysPixel } from "./rhys-pixel";

const root = document.getElementById("root");
if (root !== null) createRoot(root).render(<RhysPixel duration={999999} />);
