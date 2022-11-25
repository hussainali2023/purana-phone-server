const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { query } = require("express");

const port = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.xgu9cba.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const usersCollection = client.db("puranaPhone").collection("users");
    const categorCollection = client.db("puranaPhone").collection("category");
    const productsCollection = client.db("puranaPhone").collection("products");

    app.get("/category", async (req, res) => {
      const query = {};
      const catagories = await categorCollection.find(query).toArray();
      res.send(catagories);
    });

    app.get("/category/:companyName", async (req, res) => {
      const companyName = req.params.companyName;
      const query = {
        companyName: companyName,
      };
      const category = await productsCollection.find(query).toArray();
      return res.send(category);
    });

    app.get("/users", async (req, res) => {
      const query = {};
      const users = await usersCollection.find(query).toArray();
      res.send(users);
    });

    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      res.send({ isAdmin: user?.role === "admin" });
    });

    app.post("/adduser", async (req, res) => {
      const user = req.body;
      console.log(user);
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });
  } catch (data) {
    console.log(data);
  }
}
run().catch((data) => console.log(data));

app.get("/", async (req, res) => {
  res.send("Server is Running");
});

app.listen(port, () => {
  console.log(`Purana Phone is running on port: ${port}`);
});
