const { ObjectId } = require('mongodb');
const { v4 } = require('uuid');
const fileType = require('file-type');

class FileAPI {
    constructor(db, grpc) {
        this.db = db;
        this.grpc = grpc;
    }

    getUserFilesAndFolder = async (call, callback) => {
        try {
            const dbfiles = this.db.collection("files");
            const dbFolders = this.db.collection('folders');
            let { userId } = call.request;

            let files = await dbfiles.find({ userId, folderId: 'default' }, { _id: 1, fileName: 1, createdTime: 1, lastModified: 1, type: 1 }).toArray();
            let folders = await dbFolders.find({ userId: call.request.userId }, { _id: 1, folderName: 1, createdTime: 1, lastModified: 1 }).toArray();

            files = files.map((file) => {
                let { fileName, createdTime, lastModified } = file;
                return { fileId: file._id, fileName, createdTime, lastModified }
            });
            folders = folders.map((folder) => {
                let { folderName, createdTime, lastModified } = folder;
                return { folderId: folder._id, folderName, createdTime, lastModified }
            })

            callback(null, { files, folders });
        } catch (e) {
            callback({ code: 500, message: e })
        }
    };

    createFile = async (call, callback) => {
        try {
            const file = this.db.collection("files");
            let { fileName, folderId, userId, chunks } = call.request;
            let createdTime = new Date(), lastModified = new Date();
            let dupFile = await file.findOne({ fileName, folderId, userId });
            let {mime} = await fileType.fromBuffer(chunks);
            if (mime === 'image/jpeg') {
                if (!dupFile) {
                    let res = await file.insertOne({ fileName, folderId, content: chunks, userId, type: mime, createdTime, lastModified });
                    callback(null, { fileName, folderId, fileId: res.insertedId, createdTime: createdTime.toISOString(),type: mime, lastModified: lastModified.toISOString() });
                } else {
                    callback({ code: 400, message: 'file with same name found' });
                }
            } else {
                callback({ code: 400, message: `File type ${mime} not supported. 'image/jpeg' type only supported` });
            }

        } catch (e) {
            callback({ code: 500, message: e })
        }

    };

    createFolder = async (call, callback) => {
        try {
            const folders = this.db.collection("folders");
            let { folderName, userId } = call.request;
            let createdTime = new Date(), lastModified = new Date();
            let dupFolder = await folders.findOne({ folderName, userId });
            if (!dupFolder) {
                let res = await folders.insertOne({ folderName, userId, createdTime: createdTime.toISOString(), lastModified: lastModified.toISOString() });
                callback(null, { folderName, folderId: res.insertedId, createdTime, lastModified });
            } else {
                callback({ code: 400, message: 'folder with same name found' });
            }
        } catch (e) {
            callback({ code: 500, message: e })
        }

    };

    updateFile = async (call, callback) => {
        try {
            const files = this.db.collection("files");
            let { fileId, userId, fileName, chunks } = call.request;
            let lastModified = new Date();
            let dupFile = await files.findOne({ fileName, userId });
            let {mime} = await fileType.fromBuffer(chunks);
            if (mime === 'image/jpeg') {

                if (!dupFile) {
                    let query = { _id: ObjectId(fileId) }
                    let res = await files.updateOne({ ...query, userId }, { $set: { fileName, lastModified, content: chunks,type:mime } });
                    if (res.matchedCount && res.modifiedCount) {
                        callback(null, { fileId, fileName,type: mime, lastModified: lastModified.toISOString() });
                    }
                    else {
                        callback({ code: 400, message: "No content found for the given query" })
                    }
                } else {
                    callback({ code: 400, message: 'file with same name found' });
                }
            } else {
                callback({ code: 400, message: `File type ${mime} not supported. 'image/jpeg' type only supported` });
            }
        } catch (e) {
            callback({ code: 500, message: e })
        }
    };

    updateFolder = async (call, callback) => {
        try {
            const folders = this.db.collection("folders");
            let { folderName, userId, folderId } = call.request;
            let lastModified = new Date();
            let dupFolder = await folders.findOne({ folderName, userId });
            if (!dupFolder) {
                let query = { _id: ObjectId(folderId) }
                let res = await folders.updateOne({ ...query, userId }, { $set: { folderName, lastModified } });
                if (res.matchedCount && res.modifiedCount) {
                    callback(null, { folderId, folderName, lastModified: lastModified.toISOString() });
                }
                else {
                    callback({ code: 400, message: "No content found for the given query" })
                }
            } else {
                callback({ code: 400, message: 'folder with same name found' });
            }
        } catch (e) {
            callback({ code: 500, message: e })
        }
    };

    moveFile = async (call, callback) => {
        try {
            const files = this.db.collection("files");
            let { fileId, folderId, fileName, userId } = call.request;
            let lastModified = new Date();
            let dupFile = await files.findOne({ fileName, folderId, userId });
            if (!dupFile) {
                let res = await files.updateOne({ _id: ObjectId(fileId), userId }, { $set: { folderId, lastModified } });
                if (res.matchedCount && res.modifiedCount) {
                    callback(null, { fileId, folderId, fileName, lastModified: lastModified.toISOString() });
                } else {
                    callback({ code: 400, message: "No content found for the given query" })
                }

            } else {
                callback({ code: 400, message: 'file with same name found' });
            }
        } catch (e) {
            callback({ code: 500, message: e })
        }
    };

    downloadFile = async (call, callback) => {
        try {
            const files = this.db.collection("files");
            let result = await files.findOne({ _id: ObjectId(call.request.fileId), userId: call.request.userId }, { content: 1, fileName: 1 });
            if (result) {
                callback(null, { content: result.content.buffer, fileName: result.fileName });
            } else {
                callback({ code: 404, mesaage: 'no file found with give fileId' });
            }
        } catch (e) {
            callback({ code: 500, message: e })
        }
    };

    getFileFromFolder = async (call, callback) => {
        try {
            const dbfiles = this.db.collection("files");
            let files = await dbfiles.find({ userId: call.request.userId, folderId: call.request.folderId }, { _id: 1, fileName: 1, lastModified: 1, createdTime: 1 }).toArray();
            files = files.map((file) => {
                let { fileName, createdTime, lastModified } = file;
                return { fileId: file._id, fileName, createdTime, lastModified }
            });
            callback(null, { files });
        } catch (e) {
            callback({ code: 500, message: e })
        }
    };

};

module.exports = FileAPI