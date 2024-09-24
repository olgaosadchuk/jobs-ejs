const Job = require('../models/Job'); 
// Get all jobs
exports.getJobs = async (req, res) => {
    try {
        const jobs = await Job.find();
        res.render('jobs', { jobs }); 
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// Render the job creation/editing form
exports.renderJobForm = async (req, res) => {
    const jobId = req.params.id;
    let job = null;
    
    if (jobId) {
        job = await Job.findById(jobId);
    }
    
    res.render('jobForm', { job }); 
};

// Create a new job
exports.createJob = async (req, res) => {
    try {
        const { company, position, status } = req.body;
        await Job.create({ company, position, status });
        res.redirect('/jobs'); // Redirect to the jobs page
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// Update a job
exports.updateJob = async (req, res) => {
    const jobId = req.params.id;
    try {
        const { company, position, status } = req.body;
        await Job.findByIdAndUpdate(jobId, { company, position, status });
        res.redirect('/jobs'); 
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// Delete a job
exports.deleteJob = async (req, res) => {
    const jobId = req.params.id;
    try {
        await Job.findByIdAndDelete(jobId);
        res.redirect('/jobs'); 
    } catch (error) {
        res.status(500).send(error.message);
    }
};
