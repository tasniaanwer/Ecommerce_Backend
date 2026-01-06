// helpers/globalData.js
let globalIdToken = null;

export const setGlobalIdToken = (token) => {
  globalIdToken = token;
};

export const getGlobalIdToken = () => globalIdToken;
