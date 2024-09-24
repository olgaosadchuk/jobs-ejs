const express = require('express');
const router = express.Router();
const { createJob, updateJob, deleteJob, getJobs, renderJobForm } = require('../controllers/jobs');

// Route to get all jobs
router.get('/', getJobs);

// Route to create a new job form
router.get('/new', renderJobForm);

// Route to handle creating a new job
router.post('/', createJob);

// Route to edit a job form
router.get('/edit/:id', renderJobForm);

// Route to update a job
router.post('/update/:id', updateJob);

// Route to delete a job
router.post('/delete/:id', deleteJob);

module.exports = router;