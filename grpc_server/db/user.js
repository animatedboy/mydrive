const { verifyToken, generateToken } = require('../utils/jwt.js');
const { v4 } = require('uuid');
const { ObjectId } = require('mongodb')
const bcrypt = require('bcrypt');

class UserAPI {
    constructor(db, grpc) {
        this.db = db;
        this.grpc = grpc;
    }

    register = async (call, callback) => {
        const users = this.db.collection("users");
        let {name,email,password} = call.request;
        let user = await users.findOne({ email });
        if(!user){
            bcrypt.hash(password, 10, async (err, hash) => {
                let user = { name, email, password: hash }
                let res = await users.insertOne(user);
                let resp = {
                    userId: res.insertedId,
                    name,email,
                    token: generateToken(user)
                };
                callback(null, resp);
            });
        }else{
            callback({
                code: 400,
                message: "User Already exists",
            });
        }
    }

    login = async (call, callback) => {
        const users = this.db.collection("users");
        let {email,password} = call.request
        let user = await users.findOne({ email });
        if (user) {
            bcrypt.compare(password, user.password, (err, result) => {
                if (result) {
                    let resp = {
                        userId: user._id.toString(),
                        name: user.name,
                        email: user.email,
                        token: generateToken(user)
                    };
                    callback(null, resp);
                } else {
                    callback({
                        code: 401,
                        message: "UnAuthorized",
                    });
                }
            });
        } else {
            callback({
                code: 404,
                message: "No user found",
            });
        }

    }

    verify = (call, callback) => {
        verifyToken(call.request.token, async (usr) => {
            const users = this.db.collection("users");
            if (usr) {
                let user = await users.findOne({ email: usr.email })
                let resp = {
                    userId: user._id.toString(),
                    name: user.name,
                    email: user.email,
                };
                callback(null, resp);
            } else {
                return callback({
                    code: 404,
                    message: "No user found",
                });
            }
        })
    }

    getUser = async (call, callback) => {
        const users = this.db.collection("users");
        
        let user = await users.findOne({ userId });
        if (user) {
            let resp = {
                userId: user._id.toString(),
                name: user.name,
                email: user.email,
            }
            callback(null, resp);
        } else {
            return callback({
                code: 404,
                message: "No user found",
            });
        }
    }
};

module.exports = UserAPI