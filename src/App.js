import React, { useState, useEffect } from "react";
import { getTraffic, getTopTraffic, getWan } from "./httpCall";

import Drawer from "./components/Drawer";
import DateContainer from "./components/DateContainer";
import MetricDevicesUp from "./components/Metric/DevicesUp";
import BarSource from "./components/Bar/Source";
import BarDestination from "./components/Bar/Destination";
import LineSource from "./components/Line/Source";
import LineDestination from "./components/Line/Destination";
import LineTraffic from "./components/Line/Traffic";
import MetricDevicesDown from "./components/Metric/DevicesDown";
import MetricLinksUp from "./components/Metric/LinksUp";
import MetricLinksDown from "./components/Metric/LinksDown";

import "./App.css";

function App() {
  // set the initial end date to 5 minutes prior
  const initialDate = new Date();
  const initialMinutes = initialDate.getMinutes();
  initialDate.setMinutes(initialMinutes - 10);

  // initialize all data
  const [drawerHidden, setDrawerHidden] = useState(true);
  const [startDate, setStartDate] = useState(initialDate);
  const [endDate, setEndDate] = useState(new Date());
  const [searchDate, setSearchDate] = useState({
    start: initialDate,
    end: new Date(),
  });

  const [srcBar, setSrcBar] = useState([]);
  const [dstBar, setDstBar] = useState([]);
  const [traffic, setTraffic] = useState([]);
  const [srcLine, setSrcLine] = useState([]);
  const [dstLine, setDstLine] = useState([]);
  const [wan, setWan] = useState({
    devicesAll: [],
    devicesDown: [],
    linksAll: [],
    linksDown: [],
  });

  // useEffect
  // - activate whenever searchDate is changed
  // - get data from elasticsearch
  useEffect(() => {
    if (searchDate) {
      // format the start and end date to 2020-04-06T09:30:00
      const formatStart = searchDate.start.toISOString().split(".")[0];
      const formatEnd = searchDate.end.toISOString().split(".")[0];

      // get the data

      // get wan data
      setTimeout(async () => {
        const returnData = await getWan(formatStart, formatEnd);
        setWan(returnData);
      }, 0);

      // get traffic data
      setTimeout(async () => {
        const returnData = await getTraffic(formatStart, formatEnd);
        setTraffic(returnData);
      }, 300);

      // get source data
      setTimeout(async () => {
        const returnData = await getTopTraffic(
          formatStart,
          formatEnd,
          "source.ip",
          5
        );
        setSrcBar(returnData.bar);
        setSrcLine(returnData.line);
      }, 600);

      // get destination data
      setTimeout(async () => {
        const returnData = await getTopTraffic(
          formatStart,
          formatEnd,
          "destination.ip",
          5
        );
        setDstBar(returnData.bar);
        setDstLine(returnData.line);
      }, 900);
    }
  }, [searchDate]);

  const onSearch = () => {
    setSearchDate({
      start: startDate,
      end: endDate,
    });
  };

  // props
  const dateProps = { startDate, endDate, setStartDate, setEndDate, onSearch };
  const drawerProps = { drawerHidden, setDrawerHidden };

  return (
    <div className="main-container">
      <Drawer content={<div>Drawer</div>} {...drawerProps} />
      <DateContainer {...dateProps} />
      <div className="dashboard-wrapper">
        <div className="dashboard">
          <div className="devices-up" onClick={() => setDrawerHidden(false)}>
            <div className="box-title">Devices Up</div>
            <MetricDevicesUp {...wan} />
          </div>
          <div className="devices-down">
            <div className="box-title">Devices Down</div>
            <MetricDevicesDown {...wan} />
          </div>
          <div className="links-up">
            <div className="box-title">Links Up</div>
            <MetricLinksUp {...wan} />
          </div>
          <div className="links-down">
            <div className="box-title">Links Down</div>
            <MetricLinksDown {...wan} />
          </div>
          <div className="traffic">
            <div className="box-title">MX Traffic</div>
            <LineTraffic data={traffic} />
          </div>
          <div className="top-source-bar">
            <div className="box-title">Top 5 Sources for MX Traffic</div>
            <BarSource data={srcBar} />
          </div>
          <div className="top-dest-bar">
            <div className="box-title">Top 5 Destinations for MX Traffic</div>
            <BarDestination data={dstBar} />
          </div>
          <div className="top-source-line">
            <div className="box-title">Top 5 Sources for MX Traffic</div>
            <LineSource data={srcLine} />
          </div>
          <div className="top-dest-line">
            <div className="box-title">Top 5 Destinations for MX Traffic</div>
            <LineDestination data={dstLine} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
