import type { PlotModule } from "@/types/chartData";

const ACCENT = "#f08f00";
const ACCENT_LIGHT = "#f6b54d";

export const coverCsvUrl =
  "https://datahub.io/core/genome-sequencing-costs/_r/-/data/sequencing_costs.csv";

export const coverSpec = (
  Plot: PlotModule,
  data: unknown[],
  document?: Document
) => {
  const points = (data as { Date: string; "Cost per Genome": string }[])
    .map((row) => ({
      date: new Date(`${row.Date}-01`),
      cost: Number(row["Cost per Genome"]),
    }))
    .filter(
      (row) =>
        !Number.isNaN(row.date.getTime()) && Number.isFinite(row.cost) && row.cost > 0
    );

  return Plot.plot({
    document,
    width: Plot.width,
    height: 320,
    marginLeft: 70,
    marginBottom: 40,
    marks: [
      Plot.ruleY([1000, 10000, 100000, 1000000, 10000000], {
        stroke: "#e5e7eb",
      }),
      Plot.lineY(points, {
        x: "date",
        y: "cost",
        stroke: ACCENT,
        strokeWidth: 2.5,
        tip: true,
      }),
    ],
    x: { label: "" },
    y: { label: "Cost per genome (USD)", type: "log", grid: true },
  });
};

export const pharmaCsvUrl =
  "https://datahub.io/core/pharmaceutical-drug-spending/_r/-/data/data.csv";

export const pharmaSpec = (
  Plot: PlotModule,
  data: unknown[],
  document?: Document
) => {
  const rows = (
    data as {
      LOCATION: string;
      TIME: string;
      USD_CAP: string;
    }[]
  )
    .map((row) => ({
      location: row.LOCATION,
      year: Number(row.TIME),
      perCapita: Number(row.USD_CAP),
    }))
    .filter(
      (row) =>
        row.location &&
        Number.isFinite(row.year) &&
        Number.isFinite(row.perCapita)
    );

  const latestByCountry = new Map<string, { location: string; year: number; perCapita: number }>();
  for (const row of rows) {
    const current = latestByCountry.get(row.location);
    if (!current || row.year > current.year) {
      latestByCountry.set(row.location, row);
    }
  }

  const points = [...latestByCountry.values()]
    .sort((a, b) => b.perCapita - a.perCapita)
    .slice(0, 12);

  return Plot.plot({
    document,
    width: Plot.width,
    height: 360,
    marginLeft: 70,
    marginBottom: 40,
    marks: [
      Plot.ruleY([0], { stroke: "#e5e7eb" }),
      Plot.barY(points, {
        x: "location",
        y: "perCapita",
        fill: ACCENT_LIGHT,
        tip: true,
      }),
    ],
    x: { label: "", tickRotate: -45 },
    y: { label: "USD per capita", grid: true },
  });
};
