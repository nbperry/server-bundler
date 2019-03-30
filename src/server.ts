import express from "express";
import webpack from "webpack";
import InMemoryFs from "memory-fs";

import path from "path";

const app = express();
const port = 1337; // default port to listen

// define a route handler for the default home page
app.get("/", (req, res) => {
  res.send("Hello world!");
});

app.get("/bundle", function(req, res, next) {
  const compiler = webpack({
    entry: "/src/entry.js",
    output: {
      path: "/",
      filename: "./bundled.js"
    }
  });

  const inputFileSystem = new InMemoryFs({ "/": { "": true } });

  inputFileSystem.mkdirpSync(path.join("/", "src"));
  inputFileSystem.writeFileSync(
    path.join("/", "src", "entry.js"),
    "console.log('helloWorld');"
  );
  inputFileSystem.mkdirpSync("/node_modules");

  compiler.inputFileSystem = inputFileSystem;

  const outputFileSystem = new InMemoryFs();

  compiler.outputFileSystem = outputFileSystem;

  compiler.run(function(err, stat) {
    if (err) {
      console.log("webpack error", err);
      res.status(500).send(err);
    }
    if (stat.hasErrors()) {
      console.log("bundling error", stat);
      res.status(400).send(stat.compilation.errors);
    }

    console.log("webpack success", compiler.outputFileSystem);
    res
      .status(200)
      .send(
        (compiler.outputFileSystem as InMemoryFs).data["bundled.js"].toString()
      );
  });
});

// start the Express server
app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
