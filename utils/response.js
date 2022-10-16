let response = (err,data,res) => {
    let code = err!== null && err.code && (err.code >200 || err.code < 600) ? err.code : 500
    if(err){
        res.status(code).send(err);
    }else{
        res.status(200).send(data);
    }
}

module.exports = response;