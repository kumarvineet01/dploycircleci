const express = require("express");
let bodyParser = require("body-parser");
const { startDatabase } = require("./database");
let cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());
app.use(cors());

const dbSetup = async (req, res, next) => {
  if (!req.db) {
    const db = await startDatabase();
    req.db = db;
  }

  next();
};

app.use(dbSetup);

app.get("/", (req, res) => {
  res.send("Welcome to the Awesome Users API!");
});

app.get("/users/get", async (req, res) => {
  const users = await req.db.collection("users").find().toArray();

  res.status(200).send(users);
});

app.post("/users/create", async (req, res) => {
  try {
    //Check for existing user
    const users = await req.db
      .collection("users")
      .find({
        name: req.body.name
      })
      .toArray();

    if (users.length === 0) {
      const save_sub = await req.db.collection("users").insertOne(req.body);

      res.status(201).send({
        message: "User successfully registered"
      });
    } else {
      res.status(401).send({
        message: "User already registered"
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
