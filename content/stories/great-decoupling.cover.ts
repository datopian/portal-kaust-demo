import type { PlotModule } from "@/types/chartData";

const ACCENT = "#f08f00";
const ACCENT_LIGHT = "#f6b54d";

export const coverCsvUrl =
  "https://datahub.io/core/co2-ppm/_r/-/data/co2-annmean-gl.csv";

export const coverSpec = (
  Plot: PlotModule,
  data: unknown[],
  document?: Document
) => {
  const points = (data as { Year: string; Mean: string }[])
    .map((row) => ({
      year: Number(row.Year),
      mean: Number(row.Mean),
    }))
    .filter((row) => Number.isFinite(row.year) && Number.isFinite(row.mean));

  return Plot.plot({
    document,
    width: Plot.width,
    height: 320,
    marginLeft: 55,
    marginBottom: 40,
    marks: [
      Plot.ruleY([0], { stroke: "#e5e7eb" }),
      Plot.areaY(points, {
        x: "year",
        y: "mean",
        fill: ACCENT,
        fillOpacity: 0.14,
      }),
      Plot.lineY(points, {
        x: "year",
        y: "mean",
        stroke: ACCENT,
        strokeWidth: 2.5,
        tip: true,
      }),
    ],
    x: { label: "" },
    y: { label: "PPM", grid: true },
  });
};

export const temperatureCsvUrl =
  "https://datahub.io/core/global-temp/_r/-/data/annual.csv";

export const temperatureSpec = (
  Plot: PlotModule,
  data: unknown[],
  document?: Document
) => {
  const points = (data as { Year: string; Mean: string; Source: string }[])
    .filter((row) => row.Source === "gcag")
    .map((row) => ({
      year: Number(row.Year),
      mean: Number(row.Mean),
    }))
    .filter((row) => Number.isFinite(row.year) && Number.isFinite(row.mean));

  return Plot.plot({
    document,
    width: Plot.width,
    height: 320,
    marginLeft: 55,
    marginBottom: 40,
    marks: [
      Plot.ruleY([0], { stroke: "#d1d5db" }),
      Plot.areaY(points, {
        x: "year",
        y: "mean",
        fill: ACCENT_LIGHT,
        fillOpacity: 0.18,
      }),
      Plot.lineY(points, {
        x: "year",
        y: "mean",
        stroke: ACCENT_LIGHT,
        strokeWidth: 2.5,
        tip: true,
      }),
    ],
    x: { label: "" },
    y: { label: "Temp anomaly (°C)", grid: true },
  });
};

export const emittersCsvUrl =
  "https://datahub.io/core/co2-fossil-by-nation/_r/-/data/top-emitters.csv";

export const emittersSpec = (
  Plot: PlotModule,
  data: unknown[],
  document?: Document
) => {
  const rows = (data as { country: string; year: string; total_mt: string }[])
    .map((row) => ({
      country: row.country,
      year: Number(row.year),
      total: Number(row.total_mt),
    }))
    .filter(
      (row) =>
        row.country && Number.isFinite(row.year) && Number.isFinite(row.total)
    );

  const latestYear = Math.max(...rows.map((row) => row.year));
  const points = rows
    .filter((row) => row.year === latestYear)
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  return Plot.plot({
    document,
    width: Plot.width,
    height: 320,
    marginLeft: 130,
    marginBottom: 40,
    marks: [
      Plot.ruleX([0], { stroke: "#e5e7eb" }),
      Plot.barX(points, {
        x: "total",
        y: "country",
        fill: ACCENT,
        sort: { y: "-x" },
        tip: true,
      }),
    ],
    x: { label: "Million tonnes CO2", grid: true },
    y: { label: "" },
  });
};
