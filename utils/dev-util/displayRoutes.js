const { BASE_URL } = require("../../config/self");

module.exports = displayRoutes = (app) => {
  function print(path, layer) {
    if (layer.route) {
      layer.route.stack.forEach(
        print.bind(null, path.concat(split(layer.route.path)))
      );
    } else if (layer.name === "router" && layer.handle.stack) {
      layer.handle.stack.forEach(
        print.bind(null, path.concat(split(layer.regexp)))
      );
    } else if (layer.method) {
      console.log(
        "%s \t \x1b[33m%s\x1b[0m",
        layer.method.toUpperCase(),
        `${BASE_URL}/${path
          .concat(split(layer.regexp))
          .filter(Boolean)
          .join("/")}`
      );
    }
  }

  function split(thing) {
    if (typeof thing === "string") {
      return thing.split("/");
    } else if (thing.fast_slash) {
      return "";
    } else {
      var match = thing
        .toString()
        .replace("\\/?", "")
        .replace("(?=\\/|$)", "$")
        .match(/^\/\^((?:\\[.*+?^${}()|[\]\\\/]|[^.*+?^${}()|[\]\\\/])*)\$\//);
      return match
        ? match[1].replace(/\\(.)/g, "$1").split("/")
        : "<complex:" + thing.toString() + ">";
    }
  }

  console.log("\n\x1b[1m%s\x1b[0m", "AVAILABLE ROUTES");
  console.log(
    "\n\n------------------------------------------------------------"
  );
  app._router.stack.forEach(print.bind(null, []));
  console.log(
    "------------------------------------------------------------\n\n"
  );
};
