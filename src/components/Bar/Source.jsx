import React from "react";
import Bar from "./Bar";

// const data = [
//   { label: "172.20.1.21", data: "242" },
//   { label: "172.16.10.114", data: "30" },
//   { label: "172.217.6.45", data: "24" },
//   { label: "209.206.48.17", data: "10" },
//   { label: "157.240.22.25", data: "5" },
//   { label: "Others", data: "100" },
// ];

const BarSource = ({ data = [] }) => {
  return (
    <div className="bar">
      <Bar
        title="MX Top 5 Sources"
        data={data}
        options={{
          scales: {
            yAxes: [
              {
                scaleLabel: {
                  display: true,
                  labelString: "Sources",
                },
              },
            ],
            xAxes: [
              {
                scaleLabel: {
                  display: true,
                  labelString: "Data Transmission (Mbps)",
                },
              },
            ],
          },
        }}
      />
    </div>
  );
};

export default BarSource;
