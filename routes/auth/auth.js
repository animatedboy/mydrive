let service = require('../../grpc_client.js');
let {v4} = require('uuid');
let grpc = require('grpc');

let userClient  = new service.UserService(
    "0.0.0.0:50051",
    grpc.credentials.createInsecure()
);

let auth = () => {
    return {
        doLogin: (req, res) => {
            let { email, password } = req.body;
            userClient.login({ email, password }, (err, data) => {
                if (err) {
                    res.status(400).send('err');
                }else{
                  res.status(200).send(data);
                }
            });
        },
        registerUser: (req,res) => { 
            let {name, email, password } = req.body;
            userClient.register({ name, email, password }, (err, data) => {
                if (err) {
                    res.status(400).send('err');
                }else{
                  res.status(200).send(data);
                }
            });
        },
        verify: (req,res,next) => { 
            let token = req.headers.authorization.split(" ")[1];
            userClient.verify({token},(err,data) => {
                if (err) {
                    res.status(400).send('err');
                }else{
                    req.user = data;
                    next()
                }
                
            });
        },
        getUser: (req,res,next) => {
            let {userId} = req.body;
            userClient.getUser({userId},(err,data) => {
                if (err) {
                    res.status(400).send('err');
                }else{
                  res.status(200).send(data);
                }
            });
         }
    }
}

module.exports = auth();