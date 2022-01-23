import React from "react";
import { BarStack } from "@visx/shape";
import { Group } from "@visx/group";
import { Grid } from "@visx/grid";
import { AxisLeft, AxisBottom } from "@visx/axis";
import cityTemperature, {
  CityTemperature,
} from "@visx/mock-data/lib/mocks/cityTemperature";
import { scaleBand, scaleLinear, scaleOrdinal } from "@visx/scale";
import { useTooltip, useTooltipInPortal, defaultStyles } from "@visx/tooltip";
import { LegendOrdinal } from "@visx/legend";
import { localPoint } from "@visx/event";
import census2000 from "./census2000";

// This code structure is from airbnb.io's Bar Stack visualization example.

let census = new Object();
for (let i = 0; i < census2000.length; i++) {
  const key = census2000[i]["Year"] + "_" + census2000[i]["Age"];
  if (!Object.keys(census).includes(key)) {
    census[key] = 0;
  }
  census[key] += census2000[i]["People"];
}

let cen1900 = { year: "1900" };
let cen2000 = { year: "2000" };
for (let key of Object.keys(census)) {
  const spt = key.split("_");
  const year = spt[0];
  const age = spt[1];
  const people = census[key];
  if (year == "1900") {
    cen1900 = { ...cen1900, [age]: people };
  } else {
    cen2000 = { ...cen2000, [age]: people };
  }
}
console.log(cen1900);
console.log(cen2000);
let newCensus = [cen1900, cen2000];

export const purple3 = "#a44afe";
export const background = "#ffffff";
const defaultMargin = { top: 40, right: 0, bottom: 0, left: 0 };

const data = cityTemperature.slice(0, 12);
console.log(data);
// const keys = Object.keys(data[0]).filter((d) => d !== 'date');
const keys = Object.keys(newCensus[0]).filter((key) => key != "year");
const temperatureTotals = data.reduce((allTotals, currentDate) => {
  const totalTemperature = keys.reduce((dailyTotal, k) => {
    dailyTotal += Number(currentDate[k]);
    return dailyTotal;
  }, 0);
  allTotals.push(totalTemperature);
  return allTotals;
}, []);

const dateScale = scaleBand({
  domain: newCensus.map((cen) => cen.year),
  padding: 0.2,
});

const totalPeople = newCensus.map((cen) => {
  return Object.keys(cen).reduce((acc, k) => {
    if (k != "year") {
      return acc + cen[k];
    } else {
      return acc;
    }
  }, 0);
});

console.log("totalPeople", totalPeople);

const temperatureScale = scaleLinear({
  domain: [0, Math.max(...totalPeople)],
  nice: true,
});

let colors = [
  "#0A2F51",
  "#0C3A59",
  "#0D4761",
  "#0F5468",
  "#116270",
  "#137177",
  "#147E7B",
  "#168579",
  "#198C75",
  "#1B9371",
  "#1D9A6C",
  "#2EA36B",
  "#3FAC6C",
  "#50B56E",
  "#62BE73",
  "#74C67A",
  "#88CE86",
  "#A1D698",
  "#B8DEAA",
  "#CCE6BD",
  "#DEEDCF"
];

const colorScale = scaleOrdinal({
  domain: keys,
  range: colors,
});

let tooltipTimeout;

export default function App({
  width,
  height,
  events = false,
  margin = defaultMargin,
}) {
  const {
    tooltipOpen,
    tooltipLeft,
    tooltipTop,
    tooltipData,
    hideTooltip,
    showTooltip,
  } = useTooltip();

  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    // TooltipInPortal is rendered in a separate child of <body /> and positioned
    // with page coordinates which should be updated on scroll. consider using
    // Tooltip or TooltipWithBounds if you don't need to render inside a Portal
    scroll: true,
  });

  if (width < 10) return null;
  // bounds
  const xMax = width - margin.top - 100;
  const yMax = height - margin.top - 100;

  dateScale.rangeRound([0, xMax]);
  temperatureScale.range([yMax, 0]);

  return (
    <div style={{ position: "relative" }}>
      <h1>Difference in Total U.S Population Between 1900 and 2000</h1>
      <div style={{margin: "2rem 2rem 2rem 2rem", position: "relative"}}>
        <svg ref={containerRef} width={width - 50} height={height}>
          <rect
            x={0}
            y={0}
            width={width}
            height={height}
            fill={background}
            rx={14}
          />
          <Grid
            top={margin.top}
            left={margin.left}
            xScale={dateScale}
            yScale={temperatureScale}
            width={xMax}
            height={yMax}
            stroke="black"
            strokeOpacity={0.1}
            xOffset={dateScale.bandwidth() / 2}
          />
          <Group top={margin.top}>
            <BarStack
              data={newCensus}
              keys={keys}
              x={(cen) => cen.year}
              xScale={dateScale}
              yScale={temperatureScale}
              color={colorScale}
            >
              {(barStacks) =>
                barStacks.map((barStack) =>
                  barStack.bars.map((bar) => (
                    <rect
                      key={`bar-stack-${barStack.index}-${bar.index}`}
                      x={bar.x}
                      y={bar.y}
                      height={bar.height}
                      width={bar.width}
                      fill={bar.color}
                      onClick={() => {
                        if (events) alert(`clicked: ${JSON.stringify(bar)}`);
                      }}
                      onMouseLeave={() => {
                        tooltipTimeout = window.setTimeout(() => {
                          hideTooltip();
                        }, 300);
                      }}
                      onMouseMove={(event) => {
                        if (tooltipTimeout) clearTimeout(tooltipTimeout);
                        // TooltipInPortal expects coordinates to be relative to containerRef
                        // localPoint returns coordinates relative to the nearest SVG, which
                        // is what containerRef is set to in this example.
                        const eventSvgCoords = localPoint(event);
                        const left = bar.x + bar.width / 2;
                        showTooltip({
                          tooltipData: bar,
                          tooltipTop: eventSvgCoords?.y,
                          tooltipLeft: left,
                        });
                      }}
                    />
                  ))
                )
              }
            </BarStack>
          </Group>
          <AxisLeft scale={temperatureScale} left={80} top={margin.top} />
          <text x="-180" y="100" transform="rotate(-90)" fontSize={15}>
            Number of People
          </text>
          <AxisBottom
            top={yMax + margin.top}
            scale={dateScale}
            tickLabelProps={() => ({
              fontSize: 11,
              textAnchor: "middle",
            })}
          />
          <text x="600" y="750" fontSize={15} z={10}>
            Year
          </text>
        </svg>
        <div
        style={{
          position: "absolute",
          top: margin.top / 2 - 10,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          fontSize: "14px",
        }}
        >
        <text>Age Range</text>
        <LegendOrdinal
          scale={colorScale}
          direction="row"
          labelMargin="0 15px 0 0"
        />
      </div>
      <p>When I look through the U.S. Population dataset that is given for this assignment, 
        I felt like it is possible to answer the question: “What is the difference in total 
        U.S population between 1900 and 2000?” The visualization I chose to represent the 
        U.S Population data is a stacked bar chart comparing the total population of the two 
        years with each bar representing different age ranges. I believe that this 
        visualization best showcase how much more people we have in the 2000 compared to 
        1900 and also how much life expectancy has increased. The amount of people over 80 
        years old (represented in light green bars) are much higher in 2000 compared to that 
        in 1900.
      </p> 
      </div>
    </div>
  );
}
