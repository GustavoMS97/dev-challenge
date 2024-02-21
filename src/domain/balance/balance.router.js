const express = require('express');
const { Op } = require('sequelize');

const { PROFILE_TYPE } = require('../profile/profile.enum');
const { CONTRACT_STATUS } = require('../contract/contract.enum');

const ProfileController = require('../profile/profile.controller');
const JobController = require('../job/job.controller');

module.exports = (app) => {
  const router = express.Router();
  const { Profile, Contract, Job } = app.get('models');
  const { getProfile } = app.get('middlewares');
  const profileController = new ProfileController({ profileModel: Profile });
  const jobController = new JobController({ jobModel: Job, contractModel: Contract });

  /**
   * 5. POST /balances/deposit/:userId - Deposits money into the the the balance of a client, a client can't deposit more than 25% his total of jobs to pay. (at the deposit moment)
   */
  router.post('/deposit/:userId', getProfile, async (req, res, next) => {
    try {
      if (req.profile.type !== PROFILE_TYPE.CLIENT) {
        return res.status(401).send({ message: 'Only clients can deposit into their account' });
      } else if (req.profile.id !== parseInt(req.params.userId)) {
        return res.status(401).send({ message: 'Cannot deposit into other clients account' });
      } else if (!req.body.deposit) {
        return res.status(400).send({ message: '"deposit" is required' });
      }

      const jobs = await jobController.getJobsByPaidStatusProfileIdAndContractStatus({
        contractStatus: { [Op.not]: CONTRACT_STATUS.TERMINATED },
        profileId: req.params.userId
      });

      const totalToPay = jobs.reduce((totalValue, currentJob) => {
        return (totalValue += currentJob.price);
      }, 0);
      console.info('Total of jobs to pay: ', totalToPay);

      if (req.body.deposit > totalToPay * 0.25) {
        return res.status(400).send({ message: `Client cannot deposit more than 25% of it's total jobs to pay` });
      }

      console.info('Old balance: ', req.profile.balance);
      await profileController.updateBalanceById({ id: req.params.userId, valueToAdd: req.body.deposit });
      console.info('New balance: ', (req.profile.balance += req.body.deposit));

      return res.status(200).send();
    } catch (error) {
      next(error);
    }
  });

  return router;
};
