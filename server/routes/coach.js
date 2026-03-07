const express = require('express');
const router = express.Router();
const coachController = require('../controllers/coachController');
const { auth, coachOnly } = require('../middleware/auth');

router.use(auth);
router.use(coachOnly);

// Coach Profile Stats
router.get('/stats', coachController.getStats);

// Client Monitoring
router.get('/users', coachController.getAllUsers);
router.get('/users/:id', coachController.getUserDetails);

// Advice Management
router.post('/advice', coachController.giveAdvice);
router.put('/advice/:adviceId', coachController.editAdvice);
router.delete('/advice/:adviceId', coachController.deleteAdvice);

// Protocol/Plan Management
router.get('/protocols', coachController.getAllProtocols);
router.get('/plans', coachController.getAllProtocols);
router.post('/protocols', coachController.createProtocol);
router.post('/plans', coachController.createProtocol);
router.put('/protocols/:id', coachController.updateProtocol);
router.put('/plans/:id', coachController.updateProtocol);
router.delete('/protocols/:id', coachController.deleteProtocol);
router.delete('/plans/:id', coachController.deleteProtocol);

module.exports = router;
