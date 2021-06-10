module.exports = generateOtp = () => {
  let i,
    otp = 0;
  for (i = 0; i < 6; i++) otp = otp * 10 + Math.floor(Math.random() * 10);
  return otp;
};
