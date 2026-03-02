const ConversionRate = require("../models/ConversionRate");

/**
 * Calculate conversion + commission breakdown
 * @param {String} type - e.g. "DIAMOND_TO_INR"
 * @param {Number} amount - e.g. 100 diamonds
 * @returns {Object}
 */
const calculateConversion = async (type, amount) => {
  if (!amount || amount <= 0) {
   return res.status(400).json({message:"Amount must be greater than zero"})
  }

  const rateData = await ConversionRate.findOne({
    type: type.toUpperCase(),
    isActive: true,
  });

  if (!rateData) {
    return res.status(404).json({message:`Conversion rate not found for type: ${type}`});
  }

  const totalAmount = amount * rateData.rate;

  const hostShare = (totalAmount * rateData.hostCommission) / 100;
  const platformShare = (totalAmount * rateData.platformCommission) / 100;
  const agencyShare = (totalAmount * rateData.agencyCommission) / 100;

  return {
    type: rateData.type,
    fromCurrency: rateData.fromCurrency,
    toCurrency: rateData.toCurrency,
    baseRate: rateData.rate,
    inputAmount: amount,
    totalAmount,

    commissions: {
      hostPercent: rateData.hostCommission,
      platformPercent: rateData.platformCommission,
      agencyPercent: rateData.agencyCommission,
    },

    payouts: {
      host: Number(hostShare.toFixed(2)),
      platform: Number(platformShare.toFixed(2)),
      agency: Number(agencyShare.toFixed(2)),
    },
  };
};

module.exports = { calculateConversion };