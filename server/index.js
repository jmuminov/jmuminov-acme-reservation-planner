const {
  client,
  createTables,
  createReservation,
  createCustomer,
  createRestaurant,
  fetchCustomers,
  fetchReservations,
  fetchRestaurants,
  destroyReservations,
} = require("./db");
const express = require('express');
const app = express();
app.use(express.json());

app.get("/api/customers", async (req, res, next) => {
  try {
    res.send(await fetchCustomers());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "something went wrong" });
    next(err);
  }
});

app.get("/api/restaurants", async (req, res, next) => {
  try {
    res.send(await fetchRestaurants());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "something went wrong" });
    next(err);
  }
});

app.get("/api/reservations", async (req, res, next) => {
  try {
    res.send(await fetchReservations());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "something went wrong" });
    next(err);
  }
});

app.delete(
  "/api/customers/:customer_id/reservations/:id",
  async (req, res, next) => {
    try {
      await destroyReservation({
        customer_id: req.params.customer_id,
        id: req.params.id,
      });
      res.sendStatus(204);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "something went wrong" });
      next(err);
    }
  }
);

app.post("/api/customers/:id/reservations", async (req, res, next) => {
  try {
    res.status(201).send(
      await createReservation({
        date: req.body.date,
        party_count: req.body.party_count,
        restaurant_id: req.body.restaurant_id,
        customer_id: req.params.id,
      })
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "something went wrong" });
    next(err);
  }
});

const init = async () => {
  console.log("connecting to database");
  await client.connect();
  console.log("connected to database");
  await createTables();
  console.log("created tables");
  const [Jessica, Harvey, Pearson, Specter] = await Promise.all([
    createCustomer("Jessica"),
    createCustomer("Harvey"),
    createRestaurant("Pearson"),
    createRestaurant("Specter"),
  ]);

  console.log(await fetchCustomers());
  console.log(await fetchRestaurants());

  const [reservation, reservation2] = await Promise.all([
    createReservation(
      new Date().toISOString(),
      2,
      Pearson.id,
      Jessica.id,
    ),
    createReservation(
      new Date().toISOString(),
      4,
      Specter.id,
      Harvey.id,
    ),
  ]);
  console.log(await fetchReservations());

  await destroyReservations({
    id: reservation.id,
    customer_id: reservation.customer_id,
  });
  console.log(await fetchReservations());

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`listening on port ${port}`);
    console.log("some curl commands to test");
    console.log(`curl localhost:${port}/api/customers`);
    console.log(`curl localhost:${port}/api/restaurants`);
    console.log(`curl localhost:${port}/api/reservations`);
    console.log(
      `curl -X DELETE localhost:${port}/api/reservations/${reservation2.id}?customer_id=${reservation2.customer_id}`
    );
  });
};

init();
