const dnsController = require("./dns/controller");

exports.dns_reverse = (req, res) => dnsController.reverse(req, res);
