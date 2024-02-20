const express = require('express');

const ContractController = require('./contract.controller');
const { CONTRACT_STATUS } = require('./contract.enum');

module.exports = (app) => {
  const router = express.Router();
  const { Contract } = app.get('models');
  const { getProfile } = app.get('middlewares');
  const contractController = new ContractController({ contractModel: Contract });

  /**
   * 1. GET /contracts/:id Returns the contract by id, only if it belongs to the profile calling (fixed endpoint)
   */
  router.get('/:id', getProfile, async (req, res, next) => {
    try {
      const contract = await contractController.getByIdAndProfileId({ id: req.params.id, profileId: req.profile.id });
      if (!contract) return res.status(404).end();
      res.json(contract);
    } catch (error) {
      next(error);
    }
  });

  /**
   * 2. GET /contracts Returns a list of contracts belonging to a user (client or contractor), the list should only contain non terminated contracts.
   */
  router.get('/', getProfile, async (req, res, next) => {
    try {
      const contracts = await contractController.getByProfileIdAndStatus({
        profileId: req.profile.id,
        statusNot: CONTRACT_STATUS.TERMINATED,
        raw: true
      });
      res.json(contracts);
    } catch (error) {
      next(error);
    }
  });

  return router;
};
