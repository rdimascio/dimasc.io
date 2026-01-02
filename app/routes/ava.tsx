import type { Route } from "./+types/ava";
import { AvaLuPixel } from "../components/AvaLuPixel";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "ava lu" },
    { name: "description", content: "ava lu" },
  ];
}

export default function Ava() {
  return <AvaLuPixel duration={999999} />;
}
