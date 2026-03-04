import type { Route } from "../+types/root";
import { Welcome } from "../welcome/welcome";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "SkySentinel" },
    { name: "description", content: "Welcome to SkySentinel!" },
  ];
}

export default function Home() {
  return <Welcome />;
}
