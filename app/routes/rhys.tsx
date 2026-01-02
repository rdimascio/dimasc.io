import type { Route } from "./+types/rhys";
import { RhysPixel } from "../components/RhysPixel";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "rhys" },
    { name: "description", content: "rhys" },
  ];
}

export default function Rhys() {
  return <RhysPixel duration={999999} />;
}
