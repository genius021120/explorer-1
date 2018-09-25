const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const Transaction = require("../models/transactions");
const utils = require("../utilities/utils");

module.exports = function(app) {
  /**
   * Post API which gets data from transaction table.
   */
  app.post("/api/address-transaction", (req, res) => {
    utils.validateRequiredKeys(
      req.headers,
      [
        { key: "api_key", name: "API_KEY" },
        { key: "address", name: "ADDRESS" }
      ],
      errorField => {
        if (!errorField) {
          if (req.headers.api_key === "qscvfgrtmncefiur2345") {
            Transaction.findAll({
              [Op.or]: [
                { address_from: req.headers.address },
                { address_to: req.headers.address }
              ],
              limit: parseInt(req.headers.limit, 10)
            })
              .then(result => {
                if (result) {
                  res.statusCode = 200;
                  res.json({
                    status: 200,
                    result,
                    message: "transaction successful"
                  });
                  res.end();
                }
              })
              .catch(error => {
                console.log("error", error);
              });
          }
        } else {
          res.statusCode = 205;
          res.json({
            status: 205,
            message: errorField
          });
          res.end();
        }
      }
    );
  });
};
