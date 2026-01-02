import type { Route } from "./+types/home";
import { PixelSplash } from "../components/PixelSplash";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "dimascio" },
    { name: "description", content: "dimascio" },
  ];
}

export function loader({ context }: Route.LoaderArgs) {
  return { message: context.cloudflare.env.VALUE_FROM_CLOUDFLARE };
}

export default function Home({}: Route.ComponentProps) {
  return <PixelSplash duration={999999} />;
}
