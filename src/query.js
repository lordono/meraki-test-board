/**
 * Search for data for Traffic Line Graph
 * @param {string} start Start date to search in string format eg. 2020-04-06T09:30:00
 * @param {string} end End date to search in string format eg. 2020-04-06T10:30:00
 */
export const trafficQuery = (start, end) => ({
  query: {
    bool: {
      must_not: {
        term: {
          "source.bytes": 0,
        },
      },
      filter: {
        range: {
          "@timestamp": {
            gte: start,
            lte: end,
          },
        },
      },
    },
  },
  aggs: {
    by_timestamp: {
      date_histogram: {
        field: "@timestamp",
        calendar_interval: "1m",
      },
      aggs: {
        by_network_bytes: {
          sum: {
            field: "network.bytes",
          },
        },
      },
    },
  },
});

/**
 * Search for top X data for Bar Graph
 * @param {string} start Start date to search in string format eg. 2020-04-06T09:30:00
 * @param {string} end End date to search in string format eg. 2020-04-06T10:30:00
 * @param {string} field Index to search by - eg. source.ip
 * @param {number} size Number of Top Hits to search for - eg. 5
 */
export const barQuery = (start, end, field, size) => ({
  query: {
    bool: {
      must_not: {
        term: {
          "source.bytes": 0,
        },
      },
      filter: {
        range: {
          "@timestamp": {
            gte: start,
            lte: end,
          },
        },
      },
    },
  },
  aggs: {
    by_ip: {
      terms: {
        field: field,
      },
      aggs: {
        sum_network_bytes: {
          sum: {
            field: "network.bytes",
          },
        },
        bytes_sort: {
          bucket_sort: {
            sort: [
              {
                sum_network_bytes: { order: "desc" },
              },
            ],
            size: size,
          },
        },
      },
    },
  },
});

/**
 * Search for top X data for Line Graph
 * @param {string} start Start date to search in string format eg. 2020-04-06T09:30:00
 * @param {string} end End date to search in string format eg. 2020-04-06T10:30:00
 * @param {string} field Index to search by - eg. source.ip
 * @param {array} tophits Array of strings to search by
 */
export const lineQuery = (start, end, field, tophits) => ({
  query: {
    bool: {
      must: {
        query_string: {
          query: `(${tophits.join(") OR (")})`,
          fields: [field],
        },
      },
      must_not: {
        term: {
          "source.bytes": 0,
        },
      },
      filter: {
        range: {
          "@timestamp": {
            gte: start,
            lte: end,
          },
        },
      },
    },
  },
  aggs: {
    by_ip: {
      terms: {
        field: field,
      },
      aggs: {
        by_timestamp: {
          date_histogram: {
            field: "@timestamp",
            calendar_interval: "1m",
          },
          aggs: {
            by_network_bytes: {
              sum: {
                field: "network.bytes",
              },
            },
          },
        },
      },
    },
  },
});

export const wanQuery = (start, end) => ({
  query: {
    bool: {
      filter: {
        range: {
          "@timestamp": {
            gte: start,
            lte: end,
          },
        },
      },
    },
  },
  sort: [{ "@timestamp": "desc" }],
  size: 23,
});
