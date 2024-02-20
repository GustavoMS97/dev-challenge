const express = require('express');
const ProfileController = require('../profile/profile.controller');

module.exports = (app) => {
  const router = express.Router();
  const { Profile, Contract, Job } = app.get('models');
  const profileController = new ProfileController({ profileModel: Profile, contractModel: Contract, jobModel: Job });

  /**
   * 6. GET /admin/best-profession?start=<date>&end=<date> - Returns the profession that earned the most money
   * (sum of jobs paid) for any contactor that worked in the query time range.
   */
  router.get('/best-profession', async (req, res, next) => {
    try {
      const professionsOrderedByEarnings = await profileController.getProfessionByEarningDesc({
        raw: true,
        start: req.query.start,
        end: req.query.end
      });
      return res.status(200).send(professionsOrderedByEarnings[0]);
    } catch (error) {
      next(error);
    }
  });

  /**
   * 7. GET /admin/best-clients?start=<date>&end=<date>&limit=<integer>
   *  returns the clients the paid the most for jobs in the query time period. limit query parameter should be applied,
   *  default limit is 2.
   */
  router.get('/best-clients', async (req, res, next) => {
    try {
      const clientsThatPaidTheMost = await profileController.getClientsThatPaidTheMostWithRangeAndLimit({
        limit: req.query.limit,
        start: req.query.start,
        end: req.query.end,
        raw: true
      });
      return res.status(200).send(clientsThatPaidTheMost);
    } catch (error) {
      next(error);
    }
  });

  return router;
};
