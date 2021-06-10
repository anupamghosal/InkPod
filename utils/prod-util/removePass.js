module.exports = rmPass = (user) => {
  user.password = undefined;
  return user;
};
