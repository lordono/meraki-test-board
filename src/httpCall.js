import fetch from "node-fetch";
import dns from "dns";
import { promisify } from "util";
import {
  trafficQuery,
  barQuery,
  lineQuery,
  wanQuery,
  perfQuery,
  latencyQuery,
} from "./query";

export const getWan = async (formatStart, formatEnd) => {
  try {
    const baseUrl = process.env.REACT_APP_ES_URL;
    const wanIndex = process.env.REACT_APP_WAN_INDEX;
    const body = wanQuery(formatStart, formatEnd);
    const response = await fetch(`${baseUrl}/${wanIndex}/_search`, {
      method: "post",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
    console.log("searching for primary meraki-wan-links");
    const rjson = await response.json();
    const resData = rjson.hits.hits;
    const cleanedData = resData.map((i) => ({
      serial: i._source.serial,
      model: i._source.model,
      interface: i._source.interface,
      status: i._source.status,
      timestamp: i._source["@timestamp"],
    }));
    const devicesAllObj = {};
    const devicesDownObj = {};
    const linksAll = [];
    const linksDown = [];
    cleanedData.forEach((i) => {
      if (!(i.serial in devicesAllObj)) {
        devicesAllObj[i.serial] = i;
      }
      if (!(i.serial in devicesDownObj) && i.status === "Failed") {
        devicesDownObj[i.serial] = i;
      }
      if (i.interface) {
        linksAll.push(i);
      }
      if (i.interface && i.status !== "Active") {
        linksDown.push(i);
      }
    });
    const devicesAll = Object.values(devicesAllObj);
    const devicesDown = Object.values(devicesDownObj);
    return { linksAll, linksDown, devicesAll, devicesDown };
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const getTraffic = async (formatStart, formatEnd) => {
  try {
    const baseUrl = process.env.REACT_APP_ES_URL;
    const netflowIndex = process.env.REACT_APP_NETFLOW_INDEX;
    const body = trafficQuery(formatStart, formatEnd);
    const response = await fetch(`${baseUrl}/${netflowIndex}/_search?size=0`, {
      method: "post",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
    console.log("searching for primary filebeat - traffic");
    const rjson = await response.json();
    const resData = rjson.aggregations.by_timestamp.buckets;
    const cleanedData = [
      {
        label: "MX Traffic",
        data: resData.map((i) => ({
          x: i.key_as_string,
          y: i.by_network_bytes.value,
        })),
      },
    ];
    return cleanedData;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const getTopTraffic = async (formatStart, formatEnd, field, size) => {
  try {
    const baseUrl = process.env.REACT_APP_ES_URL;
    const netflowIndex = process.env.REACT_APP_NETFLOW_INDEX;
    const body1 = barQuery(formatStart, formatEnd, field, size);
    const response1 = await fetch(`${baseUrl}/${netflowIndex}/_search?size=0`, {
      method: "post",
      body: JSON.stringify(body1),
      headers: { "Content-Type": "application/json" },
    });
    console.log("searching for primary filebeat - ", field);
    const rjson1 = await response1.json();
    const resData1 = rjson1.aggregations.by_ip.buckets;

    // await new Promise((r) => setTimeout(r, 100));

    const body2 = lineQuery(
      formatStart,
      formatEnd,
      field,
      resData1.map((i) => i.key)
    );
    const response2 = await fetch(`${baseUrl}/${netflowIndex}/_search?size=0`, {
      method: "post",
      body: JSON.stringify(body2),
      headers: { "Content-Type": "application/json" },
    });
    console.log("searching for secondary filebeat - ", field);
    const rjson2 = await response2.json();
    const resData2 = rjson2.aggregations.by_ip.buckets;

    // dns lookup
    // const dnsObj = await resData1.reduce(async (acc, cur) => {
    //   try {
    //     const hosts = await promisify(dns.reverse)(cur.key);
    //     console.log(hosts)
    //     if (hosts && hosts.length > 0) acc[cur.key] = hosts[0]
    //     else acc[cur.key] = null
    //     return acc;
    //   } catch(err) {
    //     console.log(err)
    //     acc[cur.key] = null;
    //     return acc;
    //   }
    // }, {});

    // transform data
    const barData = resData1.map((i) => ({
      label: i.key,
      data: i.sum_network_bytes.value,
    }));
    const lineData = resData2.map((i) => ({
      label: i.key,
      data: i.by_timestamp.buckets.map((j) => ({
        x: j.key_as_string,
        y: j.by_network_bytes.value,
      })),
    }));

    return {
      bar: barData,
      line: lineData,
    };
  } catch (error) {
    console.log(error);
    return {
      bar: [],
      line: [],
    };
  }
};

export const getPerformance = async (formatStart, formatEnd) => {
  try {
    const baseUrl = process.env.REACT_APP_ES_URL;
    const netflowIndex = process.env.REACT_APP_PERFORMANCE_INDEX;
    const body = perfQuery(formatStart, formatEnd);
    const response = await fetch(`${baseUrl}/${netflowIndex}/_search?size=0`, {
      method: "post",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
    const rjson = await response.json();
    const resData = rjson.aggregations.by_serial.buckets;
    const cleanedData = resData.map((i) => ({
      label: i.key,
      data: i.by_serial.buckets
        .filter((j) => j.avg_perf.value !== null)
        .map((j) => ({
          x: j.key_as_string,
          y: j.avg_perf.value,
        })),
    }));
    return cleanedData;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const getLatency = async (formatStart, formatEnd) => {
  try {
    const baseUrl = process.env.REACT_APP_ES_URL;
    const netflowIndex = process.env.REACT_APP_LATENCY_INDEX;
    const body = latencyQuery(formatStart, formatEnd, "latencyMs");
    const response = await fetch(`${baseUrl}/${netflowIndex}/_search?size=0`, {
      method: "post",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
    const rjson = await response.json();
    const resData = rjson.aggregations.by_serial.buckets;
    const cleanedData = resData.map((i) => ({
      label: i.key,
      data: i.by_serial.buckets
        .filter((j) => j.avg_field.value !== null)
        .map((j) => ({
          x: j.key_as_string,
          y: j.avg_field.value,
        })),
    }));
    return cleanedData;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const getLoss = async (formatStart, formatEnd) => {
  try {
    const baseUrl = process.env.REACT_APP_ES_URL;
    const netflowIndex = process.env.REACT_APP_LATENCY_INDEX;
    const body = latencyQuery(formatStart, formatEnd, "lossPercent");
    const response = await fetch(`${baseUrl}/${netflowIndex}/_search?size=0`, {
      method: "post",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
    const rjson = await response.json();
    const resData = rjson.aggregations.by_serial.buckets;
    const cleanedData = resData.map((i) => ({
      label: i.key,
      data: i.by_serial.buckets
        .filter((j) => j.avg_field.value !== null)
        .map((j) => ({
          x: j.key_as_string,
          y: j.avg_field.value,
        })),
    }));
    return cleanedData;
  } catch (error) {
    console.log(error);
    return [];
  }
};
