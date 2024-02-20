const express = require('express');

const ContractController = require('./contract.controller');

module.exports = (app) => {
  const router = express.Router();
  const { Contract } = app.get('models');
  const { getProfile } = app.get('middlewares');
  const contractController = new ContractController(Contract);

  /**
   * 1 - GET /contracts/:id Returns the contract by id, only if it belongs to the profile calling
   */
  router.get('/:id', getProfile, async (req, res) => {
    const contract = await contractController.getByIdAndProfileId({ id: req.params.id, profileId: req.profile.id });
    if (!contract) return res.status(404).end();
    res.json(contract);
  });

  /**
   * 2 - GET /contracts Returns a list of contracts belonging to a user (client or contractor), the list should only contain non terminated contracts.
   */
  router.get('/', getProfile, async (req, res) => {
    const contracts = await contractController.getByProfileId({ profileId: req.profile.id, raw: true });
    if (!contracts) return res.status(404).end();
    res.json(contracts);
  });

  return router;
};
