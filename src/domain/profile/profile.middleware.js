const ProfileController = require('./profile.controller');

module.exports = (app) => {
  const { Profile } = app.get('models');
  const profileController = new ProfileController(Profile);

  return {
    getProfile: async (req, res, next) => {
      const profile = await profileController.findById(req.get('profile_id') || 0);
      if (!profile) return res.status(401).end();
      req.profile = profile;
      next();
    }
  };
};
