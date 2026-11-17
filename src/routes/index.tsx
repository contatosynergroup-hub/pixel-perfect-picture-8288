import { createFileRoute } from "@tanstack/react-router";
import { GTSolarApp } from "@/components/gt-solar/GTSolarApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GT Solar | Gestão de Orçamentos" },
      {
        name: "description",
        content:
          "Plataforma profissional de dimensionamento, precificação e gestão de propostas comerciais de soluções de energia solar e aquecimento.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return <GTSolarApp />;
}
