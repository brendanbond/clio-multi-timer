const express = require("express");
const morgan = require("morgan");
const fs = require("fs");

const axios = require("axios");
const querystring = require("querystring");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT || 5000;

require("dotenv").config();

app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(__dirname + "/dist"));

app.get("/auth", (req, res) => {
  console.log("/auth endpoint reached.");
  if (req.query.code) {
    console.log("Auth code delivered.");
    getAuthObject(req.query.code)
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        console.log(err);
        res.send(err);
      });
  } else {
    res.sendStatus(500);
    console.log("Error: no authorization code");
  }
});

app.post("/matters", (req, res) => {
  console.log("/matters endpoint reached.");
  if (!req.body.accessToken) {
    console.log("No auth token");
    return res.sendStatus(400).send("No authorization token in POST request.");
  }
  getMatters(req.body.accessToken)
    .then(data => {
      res.send(data.data);
    })
    .catch(err => {
      console.log(err);
    });
});

app.post("/categories", (req, res) => {
  console.log("/categories endpoint reached.");
  if (!req.body.accessToken) {
    console.log("No auth token");
    return res.sendStatus(400).send("No authorization token in POST request.");
  }
  getCategories(req.body.accessToken)
    .then(data => {
      res.send(data.data);
    })
    .catch(err => {
      console.log(err);
    });
});

app.post("/submit_activity", (req, res) => {
  console.log("/submit_activity endpoint reached.");
  console.log(req.body);
  if (!req.body.accessToken) {
    console.log("No auth token");
    return res.sendStatus(400).send("No authorization token in POST request.");
  }
  if (!req.body.data) {
    console.log("No data to submit");
    return res.sendStatus(400).send("No data in POST request.");
  }
  res.send(submitActivity(req.body.accessToken, req.body.data));
});

app.get("/callback", (req, res) => {
  res.sendStatus(200);
});

app.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname, "index.html"));
});

// Once we have an authorization code, we need to POST to Clio to receive access & refresh tokens
function getAuthObject(accessCode) {
  const requestBody = {
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    grant_type: "authorization_code",
    code: accessCode,
    redirect_uri:
      process.env.NODE_ENV === "production"
        ? "https://clio-multi-timer.herokuapp.com/callback"
        : "https://localhost:5000/callback"
  };

  const config = {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    }
  };

  console.log("Retrieving access token...");

  return axios
    .post(
      "https://app.clio.com/oauth/token",
      querystring.stringify(requestBody),
      config
    )
    .then(res => {
      console.log("Promise resolved");
      return res.data;
    })
    .catch(err => {
      console.log("Promise failed to resolve...");
      throw err;
    });
}

const getMatters = authToken => {
  const config = {
    params: {
      fields: "id,display_number,description",
      status: "open"
    },
    headers: {
      Authorization: authToken
    }
  };
  const url = "https://app.clio.com/api/v4/matters.json";
  return axios.get(url, config);
};

const getCategories = authToken => {
  const config = {
    params: {
      fields: "id,name",
      flat_rate: false
    },
    headers: {
      Authorization: authToken
    }
  };
  const url = "https://app.clio.com/api/v4/activity_descriptions.json";
  return axios.get(url, config);
};

const submitActivity = (authToken, data) => {
  const url = "https://app.clio.com/api/v4/activities.json";
  console.log("Data is");
  console.log(data);
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: authToken
    }
  };
  return axios.post(url, data, config).catch(err => {
    console.log(err);
  });
};

app.listen(port, () => {
  console.log("Server up");
  console.log("Process variable is " + process.env.NODE_ENV);
});
