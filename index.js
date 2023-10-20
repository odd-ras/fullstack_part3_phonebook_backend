const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const app = express();
const time = require("express-timestamp");
const cors = require("cors");

app.use(express.static("dist"));

app.use(cors());
app.use(time.init);
app.use(express.json());
app.use(bodyParser.json());

let data = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

const num = data.length;
const text = `Phonebook has info for ${num} people`;

const requestTime = function (req, res, next) {
  req.requestTime = new Date();
  next();
};

morgan.token("type", (request, response) => {
  return JSON.stringify(request.body);
});

// Returns hardcoded list of phonebook entries from given address

app.get("/api/persons", (request, response) => {
  response.json(data);
});

// Returns the number of Phonebook entries plus a timestamp for when the request was made

app.use(requestTime);

app.get("/info", (request, response) => {
  let responseText = text;
  responseText = `${text} <p>Requested at:  ${request.requestTime}</p>`;
  response.send(responseText);
});

// Returns Information on a single phonebook entry

app.get(`/api/persons/:id`, (request, response) => {
  const personId = request.params.id;
  if (data.find((person) => person.id == personId)) {
    //const personData = data.indexOf(personId);
    response.json(data[personId - 1]);
  } else {
    response.status(400).json({ message: "Resource does not exist!!" });
  }
});

app.delete("/api/persons/:id", (request, response) => {
  const personId = request.params.id;
  data = [...data].filter((person) => person.id != personId);
  response.status(200).end();
});

const generatedId = (max) => {
  return Math.floor(Math.random() * max);
};
const skipLog = (request, response) => request.method !== "POST";

app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :type",
    { skip: skipLog }
  )
);

app.post("/api/persons/", (request, response) => {
  const newEntry = request.body;
  const exists = data.find((el) => el.name === newEntry.name);

  if (!newEntry.name || !newEntry.number) {
    response
      .status(400)
      .json({ message: "Bad Request: Missing required field" });
  } else if (exists) {
    response.status(400).json({ error: "Bad Request: Name already exists" });
  } else {
    newEntry.id = generatedId(1000);
    data = data.concat(newEntry);
    response.status(200).json({ message: "POST request successful" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
