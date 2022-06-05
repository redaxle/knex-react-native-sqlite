const { knex } = require("../dist/build");

test("knex is a valid export", () => {
  expect(typeof knex).toBe("function");
});

test("knex query generation", () => {
  const db = knex({
    client: "sqlite3",
  });

  const query = db("foo").where("id", 3);
  expect(query.toString()).toBe("select * from `foo` where `id` = 3");
});
