const express = require('express');
const JobController = require('./job.controller');
const { CONTRACT_STATUS } = require('../contract/contract.enum');

module.exports = (app) => {
  const router = express.Router();
  const { Contract, Job } = app.get('models');
  const { getProfile } = app.get('middlewares');
  const jobController = new JobController({ jobModel: Job, contractModel: Contract });

  /**
   * 1 - GET /jobs/unpaid Get all unpaid jobs for a user (either a client or contractor), for active contracts only.
   */
  router.get('/unpaid', getProfile, async (req, res) => {
    const jobs = await jobController.getJobsByPaidStatusProfileIdAndContractStatus({
      paidStatus: false,
      contractStatus: CONTRACT_STATUS.IN_PROGRESS,
      profileId: req.profile.id,
      raw: true
    });
    if (!jobs) return res.status(404).end();
    res.json(jobs);
  });

  return router;
};
