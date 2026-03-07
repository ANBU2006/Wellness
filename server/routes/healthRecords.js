const express = require('express');
const router = express.Router();
const healthRecordController = require('../controllers/healthRecordController');
const { auth } = require('../middleware/auth');

router.use(auth);

router.post('/', healthRecordController.addRecord);
router.get('/:userId', healthRecordController.getUserRecords);
router.put('/:recordId', healthRecordController.updateRecord);
router.delete('/:recordId', healthRecordController.deleteRecord);

module.exports = router;
