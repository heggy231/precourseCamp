import scoreReporting from '../services/scoreReporting';

export default function globalLocals() {
  return function(req, res, next) {
    // Make user object available in templates.
    if (req.user ) {
      scoreReporting.checkUser(req.user);
    }
    res.locals.user = req.user;
    res.locals.formatDate = scoreReporting.formatDate;

    res.locals._csrf = req.csrfToken ? req.csrfToken() : null;
    if (req.csrfToken) {
      res.expose({ token: res.locals._csrf }, 'csrf');
    }
    res.locals.theme = req.user && req.user.theme ||
      req.cookies.theme ||
      'default';

    next();
  };
}
