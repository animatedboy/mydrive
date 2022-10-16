const router = require('express')();
const { route } = require('../auth/index.js');
const folderController = require('./folder.js')


router.post('/',folderController.createFolder);
router.post('/:folderId/file',folderController.createFileInFolder);
router.get('/all',folderController.getAll);
router.get('/:folderId',folderController.getFolder);
router.put('/:folderId',folderController.updateFolder);


// router.delete('/file/:fileId',file.deleteFile);
// router.delete('/folder/:folderId',file.deleteFolderId);


module.exports = router;