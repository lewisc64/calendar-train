const http = require("http");
const https = require("https");
const express = require("express");

const app = express();

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});

app.get("*", (req, res) => {
  const url = req.originalUrl.replace(/^\//, "");
  (url.startsWith("https") ? https : http).get(url, (response) => {
    let data = "";
    response.on("data", (chunk) => {
        data += chunk;
    });
    response.on("end", () => {
      res.send(data);
    });
  });
});

app.listen(8080);
