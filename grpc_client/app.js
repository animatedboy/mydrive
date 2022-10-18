const client = require("./grpc_client.js");

const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const {verify} = require('./routes/auth/auth')


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/mydrive',require('./routes/auth'));
app.use(verify);
app.use('/mydrive/api/file',require('./routes/files'));
app.use('/mydrive/api/folder',require('./routes/folders'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Server running at port %d", PORT);
});

const terminate = (msg, err = null) => {
    console.log(err);
    setTimeout(() => process.exit(/*err ? 1 : 0*/), 2000);
};
process.on('unhandledRejection', err => console.log('Unhandled rejection', err));
process.on('uncaughtException', err => console.log('Uncaught exception', err));
process.on('SIGTERM', () => terminate('Service shutting down gracefully'));
process.on('SIGINT', () => terminate('Service shutting down gracefully'));