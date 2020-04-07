import React from "react";
import Bar from "./Bar";

const BarDestination = ({ data = [] }) => {
  return (
    <div className="bar">
      <Bar
        title="MX Top 5 Destinations"
        data={data}
        options={{
          scales: {
            yAxes: [
              {
                scaleLabel: {
                  display: true,
                  labelString: "Destinations",
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

export default BarDestination;
