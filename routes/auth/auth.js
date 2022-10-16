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
            if(email && password){
                userClient.login({ email, password }, (err, data) => {
                    if (err) {
                        res.status(400).send(err);
                    }else{
                    res.status(200).send(data);
                    }
                });
        }else {
            res.status(400).send('Required fields are missing [email,password]');
        }
        },
        registerUser: (req,res) => { 
            let {name, email, password } = req.body;
            if(name && email && pasword){
            userClient.register({ name, email, password }, (err, data) => {
                if (err) {
                    res.status(400).send(err);
                }else{
                  res.status(200).send(data);
                }
            });
        }else {
            res.status(400).send('Required fields are missing [email,password]');
        }
        },
        verify: (req,res,next) => { 
            let token =  req?.headers?.authorization?.split(" ")[1];
            if(token){
                userClient.verify({token},(err,data) => {
                    if (err) {
                        res.status(401).send('UnAuthorized');
                    }else{
                        req.user = data;
                        next()
                    }
                    
                });
            }else {
                res.status(401).send('Invalid Token');
            }
        },
        getUser: (req,res,next) => {
            let {userId} = req.body;
            userClient.getUser({userId},(err,data) => {
                if (err) {
                    res.status(400).send(err);
                }else{
                  res.status(200).send(data);
                }
            });
         }
    }
}

module.exports = auth();