const BaseController = require('../core/BaseController');
const Achievemenet = require('../models/Achievemenets');

const achievemeneControlleradmin = new BaseController(Achievemenet,{
    name:"Achievements",
    access:"admin"
});


const achievemeneControllerUser = new BaseController(Achievemenet,{
    name:"Achievements",
    // access:"admin"
});

module.exports = {
    achievemeneControlleradmin,
    achievemeneControllerUser
}