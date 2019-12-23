const express = require("express");
const morgan = require("morgan");

const axios = require("axios");
const querystring = require("querystring");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT || 5000;

app.use(morgan("dev"));
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
      res.send(data);
    })
    .catch(err => {
      console.log(err);
      res.send(err);
    });
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
    redirect_uri: "https://clio-multi-timer.herokuapp.com/callback"
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
  const token = `Bearer ${authToken}`;
  const config = {
    params: {
      fields: "id,name",
      flat_rate: false
    },
    headers: {
      Authorization: token
    }
  };
  const url = "https://app.clio.com/api/v4/activity_descriptions.json";
  return axios.get(url, config);
};

const submitActivity = (authToken, data) => {
  const token = `Bearer ${authToken}`;
  const url = "https://app.clio.com/api/v4/activities.json";
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: token
    }
  };
  return axios.post(url, data, config).then(res => {
    if (res.status === 200) {
      return true;
    } else {
      return false;
    }
  });
};

app.listen(port);
