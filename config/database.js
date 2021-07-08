const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  poolSize: parseInt(process.env.POOL_SIZE) || 5,
};

// if (process.env.NODE_ENV == "DEV") options.dbName = "inkpod_dev";

module.exports = {
  uri: `mongodb+srv://inkpod-main:${process.env.DB_PASS}@cluster0.ody4x.mongodb.net/inkpod?retryWrites=true&w=majority`,
  options,
};
