import React, { useState, useEffect } from "react";
import Line from "./Line";

const LineTraffic = ({ data }) => {
  const [lineData, setLineData] = useState([]);
  const [label, setLabel] = useState("Traffic (Bytes)");
  useEffect(() => {
    if (data) {
      const allBytes = data.reduce((acc, cur) => {
        const yData = cur.data.map((j) => j.y);
        return acc.concat(yData);
      }, []);
      if (allBytes.length > 0) {
        const aveBytes = allBytes.reduce((a, b) => a + b, 0) / allBytes.length;
        if (aveBytes > 1000000) {
          const transformedData = data.map((i) => {
            return {
              label: i.label,
              data: i.data.map((j) => ({
                x: j.x,
                y: (j.y / 1000000).toFixed(2),
              })),
            };
          });
          setLineData(transformedData);
          setLabel("Traffic (MBytes)");
        } else if (aveBytes > 1000) {
          const transformedData = data.map((i) => {
            return {
              label: i.label,
              data: i.data.map((j) => ({
                x: j.x,
                y: (j.y / 1000).toFixed(2),
              })),
            };
          });
          setLineData(transformedData);
          setLabel("Traffic (KBytes)");
        } else {
          setLineData(data);
          setLabel("Traffic (Bytes)");
        }
      } else {
        setLineData([]);
        setLabel("Traffic (Bytes)");
      }
    }
  }, [data]);
  return (
    <div className="line">
      <Line
        title="MX Traffic"
        data={lineData}
        options={{
          scales: {
            yAxes: [
              {
                scaleLabel: {
                  display: true,
                  labelString: label,
                },
                ticks: {
                  min: 0,
                },
              },
            ],
            xAxes: [
              {
                type: "time",
                ticks: {
                  autoSkip: true,
                  maxTicksLimit: 10,
                },
                time: {
                  displayFormats: {
                    hour: "hA MMM D",
                  },
                  parser: "YYYY-MM-DDTHH:mm:ss.000Z",
                },
                scaleLabel: {
                  display: true,
                  labelString: "Time",
                },
              },
            ],
          },
        }}
      />
    </div>
  );
};

export default LineTraffic;
