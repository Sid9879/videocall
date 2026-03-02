const BaseController = require('../core/BaseController');
const Sponsorship = require('../models/Sponsorship');

const sponsorshipControlleradmin = new BaseController(Sponsorship,{
    name:"Sponsorship",
    access:"admin"
});


//For user or app
const sponsorshipControllerUser = new BaseController(Sponsorship,{
    name:"Sponsorship",
});

module.exports = {
    sponsorshipControlleradmin,
    sponsorshipControllerUser
}