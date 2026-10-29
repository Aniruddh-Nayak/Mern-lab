const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

let items = [
  { id: 1, name: "Book", price: 250 },
  { id: 2, name: "Pen", price: 25 }
];
let nextId = 3;

// READ all items
app.get("/api/items", (req, res) => res.json(items));

// READ one item
app.get("/api/items/:id", (req, res) => {
  const item = items.find(x => x.id === Number(req.params.id));
  if (!item) return res.status(404).json({ message: "Item not found" });
  res.json(item);
});

// CREATE an item
app.post("/api/items", (req, res) => {
  const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
  const price = Number(req.body.price);
  if (!name || req.body.price === "" || !Number.isFinite(price) || price < 0) {
    return res.status(400).json({ message: "Enter a name and a valid non-negative price." });
  }
  const item = { id: nextId++, name, price };
  items.push(item);
  res.status(201).json(item);
});

// UPDATE an item
app.put("/api/items/:id", (req, res) => {
  const item = items.find(x => x.id === Number(req.params.id));
  if (!item) return res.status(404).json({ message: "Item not found" });

  const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
  const price = Number(req.body.price);
  if (!name || req.body.price === "" || !Number.isFinite(price) || price < 0) {
    return res.status(400).json({ message: "Enter a name and a valid non-negative price." });
  }

  item.name = name;
  item.price = price;
  res.json(item);
});

// DELETE an item
app.delete("/api/items/:id", (req, res) => {
  const index = items.findIndex(x => x.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ message: "Item not found" });
  const [deleted] = items.splice(index, 1);
  res.json({ message: "Item deleted", item: deleted });
});

app.listen(PORT, () => console.log(`CRUD app running at http://localhost:${PORT}`));
