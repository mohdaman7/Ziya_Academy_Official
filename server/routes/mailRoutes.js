const express = require('express');
const mailController = require('../controllers/mailController');

const router = express.Router();

router.post('/send-enquiry', mailController.sendEnquiry);

module.exports = router;