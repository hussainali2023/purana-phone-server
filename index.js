const express = require("express");
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

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

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send("unauthorized access");
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    const usersCollection = client.db("puranaPhone").collection("users");
    const categorCollection = client.db("puranaPhone").collection("category");
    const productsCollection = client.db("puranaPhone").collection("products");
    const bookingsCollection = client.db("puranaPhone").collection("bookings");

    app.get("/category", async (req, res) => {
      const query = {};
      const catagories = await categorCollection.find(query).toArray();
      res.send(catagories);
    });

    app.post("/category", async (req, res) => {
      const category = req.body;
      console.log(category);
      const result = await categorCollection.insertOne(category);
      res.send(result);
    });

    app.get("/category/companyName", async (req, res) => {
      const query = {};
      const catagories = await categorCollection
        .find(query, { projection: { companyName: 1, _id: 0 } })
        .toArray();
      res.send(catagories);
    });

    app.get("/jwt", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      if (user) {
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, {
          expiresIn: "1d",
        });
        return res.send({ accessToken: token });
      }
      res.status(403).send({ accessToken: "" });
    });

    app.get("/category/:companyName", async (req, res) => {
      const companyName = req.params.companyName;
      const query = {
        companyName: companyName,
      };
      const category = await productsCollection.find(query).toArray();
      return res.send(category);
    });

    app.get("/users/buyer", async (req, res) => {
      const query = {
        role: "buyer",
      };
      const users = await usersCollection.find(query).toArray();
      res.send(users);
    });

    app.get("/users/seller", async (req, res) => {
      const query = {
        role: "seller",
      };
      const users = await usersCollection.find(query).toArray();
      res.send(users);
    });

    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      res.send({ isAdmin: user?.role === "admin" });
    });
    app.get("/users/seller/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      res.send({ isSeller: user?.role === "seller" });
    });

    app.post("/adduser", async (req, res) => {
      const user = req.body;
      console.log(user);
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    app.get("/users/buyer", async (req, res) => {
      const query = {};
      const users = await usersCollection.find(query).toArray();
      if (users.role === "buyer") {
        res.send(users);
      }
    });

    app.post("/bookings", async (req, res) => {
      const booking = req.body;
      const result = await bookingsCollection.insertOne(booking);
      res.send(result);
    });

    app.get("/bookings", verifyJWT, async (req, res) => {
      const email = req.query.email;
      const decodedEmail = req.decoded.email;

      if (email !== decodedEmail) {
        return res.status(403).send({ message: "forbidden access" });
      }

      const query = { email: email };
      const bookings = await bookingsCollection.find(query).toArray();
      res.send(bookings);
    });

    app.get("/products", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const products = await productsCollection.find(query).toArray();
      res.send(products);
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
