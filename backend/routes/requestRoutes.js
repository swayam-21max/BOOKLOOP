const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/role');

router.post('/', auth, checkRole(['buyer']), requestController.createRequest);
router.put('/:id/accept', auth, checkRole(['seller']), requestController.acceptRequest);
router.get('/incoming', auth, checkRole(['seller']), requestController.getIncomingRequests);
router.get('/my-requests', auth, checkRole(['buyer']), requestController.getMyRequests);

module.exports = router;
