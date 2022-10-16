let service = require('../../grpc_client.js');
let {v4} = require('uuid');
let grpc = require('grpc');
const getFormData = require('../../utils/formData.js');
const response = require('../../utils/response.js');

let fileClient  = new service.FileService(
    "0.0.0.0:50051",
    grpc.credentials.createInsecure()
);
let chunkSize = 1024 * 1024;

let folderController = () => {
    return {
        createFileInFolder: async(req, res) => {
            let data = await getFormData(req);
            let {userId} = req.user;
            let {folderId} = req.params;
            if(data.file.data.length<chunkSize){
                fileClient.createFile({ fileName:data.file.filename,userId,folderId,chunks:data.file.data }, (err, data) => {
                    response(err,data,res);
                });
            }else{
                res.status(400).send('file size is high')
            }
        },
        createFolder: (req,res) => { 
            let {folderName} = req.body;
            let {userId} = req.user;
            fileClient.createFolder({ folderName,userId }, (err, data) => {
                response(err,data,res);
            });
        },
        updateFolder: (req,res) => { 
            let {folderName} = req.body;
            let {folderId} = req.params;
            let {userId} = req.user;
            fileClient.updateFolder({ folderName,folderId,userId }, (err, data) => {
                response(err,data,res);
            });
        },
        getAll:(req,res) => { 
            let {userId} = req.user;
            fileClient.getUserFilesAndFolder({ userId }, (err, data) => {
                response(err,data,res);
            });
        },
        getFolder:(req,res) => { 
            let {userId} = req.user;
            let {folderId} = req.params
            fileClient.getFileFromFolder({ folderId,userId }, (err, data) => {
                response(err,data,res);
            });
        }

    }
}

module.exports = folderController();