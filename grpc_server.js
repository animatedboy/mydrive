const PROTO_PATH = "./proto/mydrive.proto";

const grpc = require("grpc");
const protoLoader = require("@grpc/proto-loader");
const { connectDB } = require('./db/connectDB.js');
const UserAPI = require('./db/user.js');
const FileAPI = require('./db/files.js');
let db;

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    arrays: true
});

const proto = grpc.loadPackageDefinition(packageDefinition);

async function main() {
    try {
        db = await connectDB().catch(console.dir);
        let server = new grpc.Server();
        let user = new UserAPI(db, grpc);
        let files = new FileAPI(db, grpc);

        server.addService(proto.UserService.service, {
            register: user.register,
            login: user.login,
            verify: user.verify,
            getUser: user.getUser,
        });

        server.addService(proto.FileService.service, {
            getUserFilesAndFolder: files.getUserFilesAndFolder,
            createFile: files.createFile,
            createFolder: files.createFolder,
            updateFile: files.updateFile,
            updateFolder: files.updateFolder,
            moveFile: files.moveFile,
            downloadFile: files.downloadFile,
            getFileFromFolder: files.getFileFromFolder
        });

        let address = process.env.HOST + ":" + process.env.PORT;
        server.bindAsync(address, grpc.ServerCredentials.createInsecure(), () => {
            server.start();
            console.log("Server running at " + address);
        });
    } catch (e) {
        console.log(e);
    }
}

main();

const terminate = (msg, err = null) => {
    console.log(err);
    setTimeout(() => process.exit(/*err ? 1 : 0*/), 2000);
};
process.on('unhandledRejection', err => console.log('Unhandled rejection', err));
process.on('uncaughtException', err => console.log('Uncaught exception', err));
process.on('SIGTERM', () => terminate('Service shutting down gracefully'));
process.on('SIGINT', () => terminate('Service shutting down gracefully'));
