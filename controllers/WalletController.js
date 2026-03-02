const BaseController = require('../core/BaseController');
const Wallet = require('../models/Wallet');

const walletController = new BaseController(Wallet,{
    name:"Wallet",
    access:'admin',
    get:{
        populate:[{path:"userId",select:"name email avatar"}]
    }
});





module.exports = {
    walletController
}