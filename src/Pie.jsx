import React, { useState } from "react";
import { scaleOrdinal, arc, pie, schemeTableau10 } from "d3"
import LAXData from "./output-2.js";

const Pie2 = ({ width = 600, height = 600 }) => {
  const radius = Math.min(width, height) / 2;
  const color = scaleOrdinal(schemeTableau10); //[LAXData.length]
  const [terminal, setTerminal] = useState("");
  const chosenTerminal = LAXData.filter(dat => dat.Terminal == terminal)[0];
  const avgPassenger = chosenTerminal.Avg_Passenger_Count;
  const numPassenger = chosenTerminal.Passenger_Count;
  const domPassenger = chosenTerminal.Avg_Domesticl;
  const intlPassenger = chosenTerminal.Avg_International;
  const paxRatio = domPassenger / intlPassenger;
  const pieGenerator = pie()
    .sort(null)
    .value((d) => {
      return d.Avg_Passenger_Count;
    });
  const path = arc()
    .outerRadius(radius - 10)
    .innerRadius(0);
  const arcLabel = arc()
    .outerRadius(radius - 60)
    .innerRadius(radius - 60);
  const _pieShapeData = pieGenerator(LAXData)
  return (
    <div>
      <h3>Average Share of Passenger at Los Angeles Intl. Airport</h3>
      <svg width={width} height={height}>
        <g transform={`translate(${width / 2},${height / 2})`}>
          {_pieShapeData.map((pieSlice, i) => {
            return (
              <g key={i} fontSize={10} onClick={() => setTerminal(pieSlice.data.Terminal)}>
                <path d={path(pieSlice)} fill={pieSlice.data.Terminal == terminal ? "#EEEEEE": color(i)} />
                <text
                  transform={`translate(${arcLabel.centroid(pieSlice)})`}
                  fill="#000"
                >
                  <tspan fontWeight={700} x={0}>
                    {pieSlice.data.Terminal}
                  </tspan>
                  {/* <tspan x={0} y={`${1.1}em`}>
                    {pieSlice.data.Avg_Passenger_Count}
                  </tspan> */}
                </text>
              </g>
            );
          })}

        </g>
      </svg>
      <div>
          <h3>{terminal} Terminal Information</h3>
          <text>
              <tspan>
                Average Number of Passengers: {avgPassenger} passengers
              </tspan><br></br>
              <tspan>
                Total Number of Passengers: {numPassenger} passengers
              </tspan><br></br>
          </text>
      </div>
    </div>
  );
};
export default Pie2;

