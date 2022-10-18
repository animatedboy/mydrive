const router = require('express')();
const { route } = require('../auth/index.js');
const fileContoller = require('./files.js')

router.post('/',fileContoller.createFile);

router.get('/:fileId/download',fileContoller.downloadFile);

router.put('/:fileId',fileContoller.updateFile);

router.put('/:fileId/move/:folderId',fileContoller.moveFile);

// router.delete('/file/:fileId',file.deleteFile);
// router.delete('/folder/:folderId',file.deleteFolderId);


module.exports = router;