const config=require("../config")


function pagination(req){
    let limit = parseInt(req.query.limit) || config.pagination.limit;
    if(limit > config.pagination.maxLimit){
        limit = config.pagination.maxLimit;
    }
    let page = parseInt(req.query.page) || 1;
    let skip = (page - 1) * limit;
    return { limit, skip };
}
module.exports = {
    pagination
}