import { PropertyMap } from "@/components/property-map";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/map")({
  component: MapPage,
});

function MapPage() {
  return <PropertyMap />;
}
