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
import AreaChart from "./img/AreaChart.png";
import ArrVsDep from "./img/ArrVsDep.png";
import BarChart from "./img/BarChart.png";
import DomVsIntl from "./img/DomVsIntl.png";
import DomVsIntlPie from "./img/DomVsIntlPie.png";
import PieChart from "./img/PieChart.png";

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
  "#DEEDCF",
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
    <div style={{ 
      position: "relative",
      margin: "4rem",
    }}>
      <a href="https://github.com/bestwatana/info-474-bestwatana.git">
        Link to GitHub Repo
      </a>
      <h1>Assignment 1</h1>
      <h2>Difference in Total U.S Population Between 1900 and 2000</h2>
      <div style={{ margin: "2rem 2rem 2rem 2rem", position: "relative" }}>
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
      </div>
        <p>
          When I look through the U.S. Population dataset that is given for this
          assignment, I felt like it is possible to answer the question: “What
          is the difference in total U.S population between 1900 and 2000?” The
          visualization I chose to represent the U.S Population data is a
          stacked bar chart comparing the total population of the two years with
          each bar representing different age ranges. I believe that this
          visualization best showcase how much more people we have in the 2000
          compared to 1900 and also how much life expectancy has increased. The
          amount of people over 80 years old (represented in light green bars)
          are much higher in 2000 compared to that in 1900.
        </p>
      <div
      > 
        <h1>Assignment 2</h1>
        <h2>Los Angeles International Airport Passenger Traffic Analysis</h2>
        <p>
          The “Los Angeles International Airport Passenger Traffic By Terminal”
          dataset contains data on the number of passenger collected monthly
          from 2006 to 2021. The annual passenger count is divided into
          different categories and sub-categories in each row. We have 12
          different terminals and within each terminal, the count is divided
          into international and domestic passengers and arrival and departure
          passengers. I believe creating visualizations based on this dataset
          will give us insightful passenger demographics at LAX and how COVID-19
          has impacted air travel at one of the busiest international airports
          in the US.  
        </p>
        <p>
          There are multiple types of visualization in this analysis including
          bar charts, line charts, pie charts, and area charts. Starting off, I knew a bar chart showcasing the total
          number of passengers in each terminal would be the best overall
          visualization for this dataset allowing us to compare how much
          passenger traffic each terminal has been handling over the years. I
          have decided to divided each bar into 2 stacks to reveal how many
          passenger in each terminal are international or domestic passenger.
        </p>
        <p>
          With the given data, some visualizations are more benefitial when colors are
          used to help differentiate the different categories. In the area chart and 
          pie chart showing differences in numbers between multiple terminals, color 
          helps us visually differentiate each terminal and is more effective than if
          if the visualization is done in grayscale. 
        </p>
        <p
          style={{
            paddingBottom: "2rem",
          }}
        >
          Another chart that I believe revealed important insight is the
          various pie charts visualizing the ratio between total domestic and
          international passengers each year at LAX. It was revealed that
          international traffic has covered over 25% of the total traffic data
          every year in this data until 2020. In 2021 less than 20% of
          passengers at LAX are international passenger. This is because
          domestic traffic at LAX has recovered at a faster rate than
          international traffic as seen in the previous visualization. Each pie 
          chart sizes are different allowing us to see how the number of 
          passengers decrease or increase each year.         
        </p>
        <h3>Focus Questions</h3>
        <ul>
          <li>
            Which terminal is overall the busiest at LAX?
          </li>
          <li>
            How has LAX handle international and domestic passengers?
          </li>
          <li>
            How has COVID-19 affected passenger traffic at LAX?
          </li>
        </ul>
        <img
          src={BarChart}
          style={{
            width: "80%",
          }}
          alt="Domestic vs International by Terminal Bar Chart"
        />
        <p
          style={{
            width: "80%",
            paddingBottom: "4rem",
          }}
        >
          According to this visualization, you can see that TBIT terminal
          handles most international passengers at LAX while other terminals
          except TBIT West Gates and Terminal 2 handles mostly domestic
          passengers. Overall, the TBIT terminal also handles the most
          passengers at LAX followed by Terminal 4.
        </p>
        <img 
          src={ArrVsDep}
          style={{
            width: "80%",
          }} 
          alt="Arrival vs Departure Line Chart" 
        />
        <p
          style={{
            width: "80%",
            paddingBottom: "4rem",
          }}
        >
          This line chart showcases the average number of arrival and departure
          passengers each month at LAX. Overall, LAX sees more passengers during
          the summer season. It is also noteworthy to see that the number of
          arrival passengers is almost always slightly higher than the number of
          departure passengers.
        </p>
        <img 
          src={PieChart} 
          style={{
            width: "80%",
          }}   
          alt="Share of Passenger by Terminal Pie Chart" 
        />
        <p
          style={{
            width: "80%",
            paddingBottom: "4rem",
          }}
        >
          This pie chart showcases the share of passenger traffic at LAX by
          terminal. Overall, Terminal 1 receives the most passengers traffic on
          average followed by TBIT.
        </p>
        <img 
          src={DomVsIntl} 
          style={{
            width: "80%",
          }}            
          alt="Domestic vs International Line Chart" 
        />
        <p
          style={{
            width: "80%",
            paddingBottom: "4rem",
          }}
        >
          Here you can understand the impact of the COVID-19 pandemic on
          passenger count at LAX airport. The number of passengers decreased
          dramatically for both domestic and international passengers in 2020.
          However, based on 2021 data, domestic traffic seems to be recovering 
          from the pandemic at a faster rate than international traffic.
        </p>
        <img
          src={AreaChart}
          style={{
            width: "80%",
          }}  
          alt="Passenger Count of Each Terminal By Year Area Chart"
        />
        <p
          style={{
            width: "80%",
            paddingBottom: "4rem",
          }}
        >
          This area graph comparing passenger numbers for each terminal during
          each year revealed the closure of Terminal 3 (dark green) in 2020 and the lack
          of recovery from the pandemic in some terminals like Terminal 1
          (bright orange), Terminal 4 (light green), and TBIT (red) which hasn't fully
          grown back to its pre-pandemic traffic numbers.
        </p>
        <img 
          src={DomVsIntlPie}
          style={{
            width: "80%",
          }}             
          alt="Domestic vs International Pie Chart" 
        />
        <p
          style={{
            width: "80%",
            paddingBottom: "4rem",
          }}
        >
          These various pie charts showcase the ratio between international and
          domestic passengers each year at LAX. The number of international
          passengers has always exceeded 25% until the pandemic hit. In 2021,
          less than 20% of the total number of passengers at LAX are
          international passengers. The pie chart in 2020 is also significantly
          smaller than other graphs as travel restrictions are heavily imposed
          in that year.
        </p>
      </div>
    </div>
  );
}
