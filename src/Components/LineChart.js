import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Label } from "recharts";

const LineChartComp = ({ chartData }) => {


  var min = Math.min(...chartData.map(item => item.value))
  var max = Math.max(...chartData.map(item => item.value))


  return (
    <LineChart
      width={500}
      height={300}
      data={chartData}
      // margin={{ top: 15, right: 30, left: 20, bottom: 5 }}

      margin={{ top: 15, right: 30, left: 35, bottom: 5  }}
    >
      <Line type="monotone" dataKey="value" stroke="#8884d8" width={2} dot={false} />
      <XAxis dataKey="time" >
        <Label value="Time" offset={-5} position="insideBottom" style={{  textAnchor: 'middle', fontSize: '80%', fill: 'white' }} />
      </XAxis>
      <YAxis domain={[min, max]}  >
      <Label value="LYKA price in BUSD" angle={-90} offset={-25} position="insideLeft" style={{  textAnchor: 'middle', fontSize: '80%', fill: 'white' }} />

        </YAxis>



      <Tooltip />
    </LineChart>
  )
};

export default LineChartComp;
