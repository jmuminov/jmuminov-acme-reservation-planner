const pg = require("pg");
const client = new pg.Client(
  process.env.DATABASE_URL ||
    "postgres://postgres@localhost/acme_reservation_planner"
);
const uuid = require("uuid");

const createTables = async () => {
  try {
    const SQL = `
      DROP TABLE IF EXISTS reservations;
      DROP TABLE IF EXISTS customer;
      DROP TABLE IF EXISTS restaurant;
      CREATE TABLE customer (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL
      );
      CREATE TABLE restaurant (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL
      );
      CREATE TABLE reservations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        date DATE NOT NULL,
        party_count INTEGER NOT NULL,
        restaurant_id UUID REFERENCES restaurant(id),
        customer_id UUID REFERENCES customer(id)
      );
    `;

    await client.query(SQL);
  } catch (err) {
    console.error(err);
  }
};

const createCustomer = async (name) => {
  try {
    const SQL = `
    INSERT INTO customer (id, name) VALUES ($1, $2) RETURNING *;
    `;
    const response = await client.query(SQL, [uuid.v4(), name]);
    return response.rows[0];
  } catch (err) {
    console.error(err);
  }
};

const createRestaurant = async (name) => {
  try {
    const SQL = `
    INSERT INTO restaurant (id, name) VALUES ($1, $2) RETURNING *;
    `;
    const response = await client.query(SQL, [uuid.v4(), name]);
    return response.rows[0];
  } catch (err) {
    console.error(err);
  }
};

const fetchCustomers = async () => {
  try {
    const SQL = `
    SELECT * FROM customer;
    `;
    const response = await client.query(SQL);
    return response.rows;
  } catch (err) {
    console.error(err);
  }
};

const fetchRestaurants = async () => {
  try {
    const SQL = `
    SELECT * FROM restaurant;
    `;
    const response = await client.query(SQL);
    return response.rows;
  } catch (err) {
    console.error(err);
  }
};

const createReservation = async (
  date,
  party_count,
  restaurant_id,
  customer_id
) => {
  try {
    const SQL = `
    INSERT INTO reservations (id, date, party_count, restaurant_id, customer_id) VALUES ($1, $2, $3, $4, $5) RETURNING *;
    `;
    const response = await client.query(SQL, [
      uuid.v4(),
      date,
      party_count,
      restaurant_id,
      customer_id,
    ]);
    return response.rows[0];
  } catch (err) {
    console.error(err);
  }
};

const fetchReservations = async () => {
  try {
    const SQL = `
    SELECT * FROM reservations;
    `;
    const response = await client.query(SQL);
    return response.rows;
  } catch (err) {
    console.error(err);
  }
};

const destroyReservations = async ({ id, customer_id }) => {
  console.log("destroyReservations", id, customer_id);
  try {
    const SQL = `
    DELETE FROM reservations WHERE id = $1 AND customer_id = $2;
    `;
    await client.query(SQL, [id, customer_id]);
  } catch (err) {
    console.error(err);
  }
};

module.exports = {
  client,
  createTables,
  createCustomer,
  createRestaurant,
  fetchCustomers,
  fetchRestaurants,
  createReservation,
  fetchReservations,
  destroyReservations,
};
