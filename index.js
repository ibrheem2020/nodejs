const express = require("express");
const app = express();
const ejs = require("ejs");
const path = require("path");
const methodOverride = require("method-override");
const getTask = require("./pup");
const bodyParser = require("body-parser");
const tasksProofs = require("./tasks");
const port = 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(bodyParser.json());
app.use(express.static("public"));

app.get("/start", async (req, res) => {
  // console.log("getting pcode");
  // let i = await getTask("https://voip.pcrsemarang.id/?job=9d83bca57027&worker=6e90e189");
  // if (i) {
  //   console.log(i);
  // }
  res.render("home");
});
app.post("/getcode", async (req, res) => {
  const { enteredUrl } = req.body;
  try {
    let url = new URL(enteredUrl);
    const pcode = await getTask(url);
    res.json({
      success: true,
      message: "Form data received successfully.",
      code: pcode,
      site: url.hostname,
    });
  } catch (err) {
    res.json({
      success: false,
      site: `URL Error: ${err}`,
    });
  }
});
app.post("/getPcode", async (req, res) => {
  const { taskUrlResponse } = req.body;
  try {
    let url = new URL(taskUrlResponse);
    const response = await getTask(url);
    if (response.pcode) {
      res.json({
        success: true,
        pcode: response.pcode,
        vproof: response.vproof,
        proof_1: response.proof_1,
        proof_2: response.proof_2,
        site: url.hostname,
      });
    } else if (response.error || response.errorName) {
      res.json({
        success: false,
        site: url.hostname,
        error: response.error,
        errorName: response.errorName,
      });
    }
  } catch (err) {
    res.json({
      success: false,
      site: `URL Error: ${err}`,
    });
  }
});

app.post("/getFixedTaskData", (req, res) => {
  const { taskUrlResponse } = req.body;

  let dataObj = getProperty(tasksProofs, taskUrlResponse);
  if (dataObj) {
    res.json({ success: true, dataObj });
    //condition to not send the code page
  }
  // else if (dataObj.codePage) {
  //   let { codePage, ...filteredObject } = dataObj;
  //   res.json({ success: true, dataObj: filteredObject });
  // }
  else {
    res.json({ success: false, error: "Couldn't find DATA with this URL" });
  }

  function getProperty(obj, propertyName) {
    if (obj.hasOwnProperty(propertyName)) {
      return obj[propertyName];
    } else {
      return null;
    }
  }
  // let proofCount = Object.keys(dataObj).filter((key) => key.startsWith("proof_")).length;
  //   console.log("Number of proof_n properties:", proofCount);
});

app.listen(port, () => {
  console.log(`app running on port ${port}`);
});
