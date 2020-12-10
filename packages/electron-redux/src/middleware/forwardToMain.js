import { ipcRenderer } from 'electron';
import validateAction from '../helpers/validateAction';

// eslint-disable-next-line consistent-return, no-unused-vars
export const forwardToMainWithParams = (params = {}) => store => next => action => {
  const { blacklist = [] } = params;
  if (!validateAction(action)) return next(action);

  if (action.meta && action.meta.scope === 'local') return next(action);

  // change scope to local, both dispatch
  const rendererAction = {
    ...action,
    meta: {
      ...action.meta,
      scope: 'local',
    },
  };
  /*
   */
  if (blacklist.some(rule => rule.test(action.type))) {
    return next(action);
  } else {
    // stop action in-flight
    ipcRenderer.send('redux-action', rendererAction);
    return next(action);
  }
};

const forwardToMain = forwardToMainWithParams({
  blacklist: [/^@@/, /^redux-form/],
});

export default forwardToMain;
