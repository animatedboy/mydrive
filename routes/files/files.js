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

let fileContoller = () => {
    return {
        createFile: async(req,res) => {
            let data = await getFormData(req);
            let {userId} = req.user;
            if(data.file.data.length<chunkSize){
                fileClient.createFile({ fileName:data.file.filename,userId,folderId:'default',chunks:data.file.data }, (err, data) => {
                response(err,data,res);
                });
            }else{
                res.status(400).send('file size is high')
            }
        },
        updateFile: (req,res) => { 
            let {fileName} = req.body;
            let {fileId} = req.params;
            let {userId} = req.user;
            fileClient.updateFile({ fileName,fileId,userId }, (err, data) => {
                response(err,data,res);
            });
        },
        moveFile: (req,res) => { 
            let {fileId,folderId} = req.params;
            let {fileName} = req.body;
            let {userId} = req.user;
            fileClient.moveFile({ fileId,folderId,fileName,userId }, (err, data) => {
                response(err,data,res);
            });
        },
        downloadFile:(req,res) =>{
            let {userId} = req.user;
            let {fileId} = req.params;
            fileClient.downloadFile({fileId,userId},(err,data) =>{
                if(err){
                    res.status(err?.code||500).send(err.message);
                }else{
                    res.set('Content-Disposition', `attachment; filename="${data.fileName}"`);
                    res.set('Content-Type', 'application/octet-stream');
                    res.send(data.content);
                }
            })
        }

    }
}

module.exports = fileContoller();