const router = require('express')();
const auth = require('./auth.js')

router.post('/login',auth.doLogin);
router.post('/register',auth.registerUser);


module.exports = router;