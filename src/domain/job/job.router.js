const express = require('express');

const { CONTRACT_STATUS } = require('../contract/contract.enum');

const JobController = require('./job.controller');
const ProfileController = require('../profile/profile.controller');
const { PROFILE_TYPE } = require('../profile/profile.enum');

module.exports = (app) => {
  const router = express.Router();
  const { Contract, Job, Profile } = app.get('models');
  const { getProfile } = app.get('middlewares');
  const jobController = new JobController({ jobModel: Job, contractModel: Contract });
  const profileController = new ProfileController({ profileModel: Profile });

  /**
   * 3. GET /jobs/unpaid Get all unpaid jobs for a user (either a client or contractor), for active contracts only.
   */
  router.get('/unpaid', getProfile, async (req, res, next) => {
    try {
      const jobs = await jobController.getJobsByPaidStatusProfileIdAndContractStatus({
        paidStatus: false,
        contractStatus: CONTRACT_STATUS.IN_PROGRESS,
        profileId: req.profile.id,
        raw: true
      });
      res.json(jobs);
    } catch (error) {
      next(error);
    }
  });

  /**
   * 4. POST /jobs/:job_id/pay - Pay for a job, a client can only pay if his balance >= the amount to pay. The amount should be moved from the client's balance to the contractor balance.
   */
  router.post('/:job_id/pay', getProfile, async (req, res, next) => {
    try {
      if (req.profile.type !== PROFILE_TYPE.CLIENT) {
        return res.status(401).send({ message: 'Only a client can perform the payment action' });
      }
      const job = await jobController.getJobByIdAndProfileId({ id: req.params.job_id, profileId: req.profile.id });
      if (!job) {
        return res.status(404).send({ message: 'Job not found' });
      } else if (job.paid) {
        return res.status(400).send({ message: 'Job is already paid' });
      }
      const clientProfile = await profileController.findById({ id: req.profile.id });
      if (clientProfile.balance < job.price) {
        return res.status(400).send({ message: `You don't have enough balance to pay for this job` });
      }
      const promiseResults = await Promise.all([
        profileController.updateBalanceById({ id: req.profile.id, valueToAdd: -job.price }),
        profileController.updateBalanceById({ id: job.Contract.ContractorId, valueToAdd: job.price }),
        jobController.updatePaidById({ id: req.params.job_id })
      ]);

      console.info('Promise results', promiseResults);

      return res.status(200).send();
    } catch (error) {
      next(error);
    }
  });

  return router;
};
