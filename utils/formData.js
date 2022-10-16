const multiparty = require('multiparty');

let getFormData = req => {
    
    let result = {};
    
    return new Promise((resolve,reject) => {
      
        let form =  new multiparty.Form();
        
        form.on('part', part => {
          
          var chunks = [];
          part.on('data', chunks.push.bind(chunks));
          
          part.on('end', () => {
            let data = Buffer.concat(chunks);
            result[part.name] = part.filename ? { ...part, data } : data.toString('binary');
          });
          
          part.on('error', function(err) {
              req.getPersist().getLogger().error( "Error in getformdata >> " + err);
              return reject({
                  code: 400,
                  message: "Invalid data in post form"
              }); 
          });
          
        });

        form.on('close', () => resolve(result));
        
        form.on('error', function(err) {
          
          req.getPersist().getLogger().error( "Error in getformdata >> " + err);
          return reject({
              code: 400,
              message: "Invalid data in post form"
          });
          
        });
        
        form.parse(req);
        
    });
    
};

module.exports = getFormData;