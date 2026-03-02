const BaseController = require('../core/BaseController');
const ConversionRate = require('../models/ConversionRate');


const conversionRateControlleradmin = new BaseController(ConversionRate,{
    name:"Conversion Rate",
    access:"admin",
   create: {
    pre: async (body, req, res) => {
      const userId = req.user && req.user._id;
      if (!userId) {
        res.status(401).json({ message: "Unauthorized: user required" });
        return;
      }

      body.updatedBy = userId;
    },
  },
});


const conversionRateController = new BaseController(ConversionRate,{
    name:"Conversion Rate"
});



module.exports = {
    conversionRateControlleradmin,
    conversionRateController
}