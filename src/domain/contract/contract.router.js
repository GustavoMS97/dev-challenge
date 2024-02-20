const express = require('express');

const ContractController = require('./contract.controller');

module.exports = (app) => {
  const router = express.Router();
  const { Contract } = app.get('models');
  const { getProfile } = app.get('middlewares');
  const contractController = new ContractController(Contract);
  router.get('/:id', getProfile, async (req, res) => {
    const contract = await contractController.getByIdAndProfileId(req.params.id, req.profile.id);
    if (!contract) return res.status(404).end();
    res.json(contract);
  });

  return router;
};
