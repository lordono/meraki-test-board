import React from "react";
import Metric from "./Metric";

const MetricLinksDown = ({ linksDown = [] }) => {
  return <Metric title="Links Down" value={linksDown.length} />;
};

export default MetricLinksDown;
