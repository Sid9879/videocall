const BaseController = require('../core/BaseController');
const TermAndPolicy = require('../models/TermAndPolicy');

const termAndPolicyControlleradmin = new BaseController(TermAndPolicy,{
    name:"Term And Policy",
    access:"admin",
    get:{
        query:['type']
    }
});

//Show Term and policy to everyOne
const termAndPolicyController = new BaseController(TermAndPolicy,{
    name:"Term And Policy",
      get:{
        query:['type']
    }
})

module.exports = {
    termAndPolicyControlleradmin,
    termAndPolicyController
}