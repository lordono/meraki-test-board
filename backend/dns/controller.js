const dns = require("dns");

async function lookupPromise(ip) {
  return new Promise((resolve, reject) => {
    dns.reverse(ip, (err, hostnames) => {
      if (err) reject(err);
      resolve(hostnames);
    });
  });
}

/**
 * Does a reverse dns for given ip
 */
exports.reverse = async (req, res) => {
  const ip = req.query.ip;
  if (ip) {
    try {
      const hostnames = await lookupPromise(ip);
      if (hostnames) return res.json(hostnames);
      else return res.json([]);
    } catch (error) {
      return res.json([]);
    }
  } else {
    return res.json([]);
  }
};
