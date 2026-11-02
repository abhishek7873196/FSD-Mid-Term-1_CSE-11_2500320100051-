import express from "express";
const port = process.env.PORT || 3000;
const app = express();
app.use(express.json());
const books = [
  {
    id: 101,
    title: "Java Programming",
    author: "Herbert Schildt",
    category: "Programming",
    quantity: 5,
    available: 5,
  },
];
app.post("/api/books", (req, res) => {
  const { id, title, author, category, quantity, available } = req.body;
  if (id === undefined || !title || !author || !category || quantity === undefined) {
    return res.status(400).json({ message: "id, title, author, category and quantity are required" });
  }
  if (typeof quantity !== "number" || quantity < 0) {
    return res.status(400).json({ message: "quantity must be a non-negative number" });
  }
  if (books.some((b) => b.id === id)) {
    return res.status(409).json({ message: "book id already exists" });
  }
  const newBook = { id, title, author, category, quantity, available };
  books.push(newBook);
  res.status(201).json({ message: "book added successfully", newBook });
});
app.get("/api/books", (req, res) => {
  if (books.length === 0) {
    return res.status(200).json({ message: "no books available", books });
  }
  res.status(200).json({ message: "data received", books });
});
app.get("/api/books/:id", (req, res) => {
  const book = books.find((b) => b.id === Number(req.params.id));
  if (!book) {
    return res.status(404).json({ message: "book not found" });
  }
  res.status(200).json({ message: "book found", book });
});
app.put("/api/books/:id", (req, res) => {
  const book = books.find((b) => b.id === Number(req.params.id));
  if (!book) {
    return res.status(404).json({ message: "book not found" });
  }
  const { title, author, category, quantity, available } = req.body; // id from body is ignored
  if (title !== undefined) book.title = title;
  if (author !== undefined) book.author = author;
  if (category !== undefined) book.category = category;
  if (quantity !== undefined) book.quantity = quantity;
  if (available !== undefined) book.available = available;
  res.status(200).json({ message: "book updated successfully", book });
});
app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
app.delete("/api/books/:id", (req, res) => {
  const index = books.findIndex((b) => b.id === Number(req.params.id));
  if (index === -1) {
    return res.status(404).json({ message: "book not found" });
  }
  const deletedBook = books.splice(index, 1)[0];
  res.status(200).json({ message: "book deleted successfully", deletedBook });
});
app.get("/api/books/search", (req, res) => {
  const { title, author, category } = req.query;
  const results = books.filter(
    (b) =>
      (!title || b.title.toLowerCase().includes(title.toLowerCase())) &&
      (!author || b.author.toLowerCase().includes(author.toLowerCase())) &&
      (!category || b.category.toLowerCase().includes(category.toLowerCase()))
  );
  if (results.length === 0) {
    return res.status(200).json({ message: "no books found", books: results });
  }
  res.status(200).json({ message: "books found", count: results.length, books: results });
});
app.post("/api/books/:id/issue", (req, res) => {
  const book = books.find((b) => b.id === Number(req.params.id));
  if (!book) {
    return res.status(404).json({ message: "book not found" });
  }
  if (book.available <= 0) {
    return res.status(400).json({ message: "no copies available to issue" });
  }
  book.available -= 1;
  res.status(200).json({ message: "book issued successfully", book });
});
app.post("/api/books/:id/return", (req, res) => {
  const book = books.find((b) => b.id === Number(req.params.id));
  if (!book) {
    return res.status(404).json({ message: "book not found" });
  }
  if (book.available >= book.quantity) {
    return res.status(400).json({ message: "all copies are already returned" });
  }
  book.available += 1;
  res.status(200).json({ message: "book returned successfully", book });
});