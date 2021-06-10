const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  poolSize: parseInt(process.env.POOL_SIZE) || 5,
};

module.exports = {
  uri: `mongodb+srv://inkpod-main:${process.env.DB_PASS}@cluster0.ody4x.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`,
  options,
};
