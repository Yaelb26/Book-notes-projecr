import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import ejs from "ejs";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "Books",
  password: "Moomin2612",
  port: 5432,
});
db.connect();

let currentBook = 2;
let index = 0;
let text = "";
let items = [];
let quotes = [];

// Selects a book
async function getCurrentList() {
  const result = await db.query("SELECT * FROM books order by id asc");
  items = result.rows;
  return items.find((item) => item.id == currentBook);
}
// Selects all notes foe selected book
async function getCurrentNotes() {
  const result = await db.query("SELECT * FROM booknotes where book_id=($1)", [
    currentBook,
  ]);
  quotes = result.rows;
}

  // Adds a new note
async function updateCurrentNote() {
  const result = await db.query(
    "UPDATE booknotes SET quote = quote || ($1) WHERE id = ($2) ",
    [text, index]
  );
}

// Deletes a note
async function deleteCurrentNote() {
  const result = await db.query("delete from booknotes where id=($1)", [index]);
}

// homepages- presents all the notes stored
app.get("/", async (req, res) => {
  const input = await getCurrentList();
  const input2 = await getCurrentNotes();
  res.render("index.ejs", {
    items: items,
    currentBook: currentBook,
    quotes: quotes,
    id: input,
  });

});

// Displays selected book's quotes
app.post("/item", async (req, res) => {
  let currentId = req.body.item;
  currentBook = currentId;
  res.redirect("/");
});

// edit or delete selected quote
app.post("/menu", async (req, res) => {
  let check = req.body.menu;
  if (check == "edit") {
    index = req.body.quote_id;
    text = req.body.text;
    const result = await updateCurrentNote();
  } else if (check == "delete") {
    index = req.body.quote_id;
    const result = await deleteCurrentNote();
  }
  res.redirect("/");
  console.log(req.body);
});

// adds new note to selected book
app.post("/add", async (req, res) => {
  console.log(req.body);
  let newNote = req.body.text;
  let newNotePage = req.body.page;
  let newNoteId = req.body.book_id;
  const result = await db.query(
    "INSERT INTO booknotes (quote,page, book_id) VALUES ($1,$2, $3) RETURNING *;",
    [newNote, newNotePage, newNoteId]
  );

  res.redirect("/");
});

// Search a new book to add to list
app.post("/search", async (req, res) => {
  res.render("search.ejs");
});

Sends added book to list and redirects to homepage
app.post("/send", async (req, res) => {
  console.log(req.body);

  const isbn = req.body.isbn;

  // Check if the ISBN already exists
  const checkQuery = await db.query("SELECT * FROM books WHERE isbn = $1", [
    isbn,
  ]); // Efficiently checks for existence
  const checkResult = checkQuery.rows;

  if (checkResult.length > 0) {
    // ISBN already exists
    return res.send(
      "<script>alert('Isbn is in use, try again!'); window.location='/'</script>"
    );
  } else {
    //new isbn
    let title = req.body.title;
    let author = req.body.author;
    let isbn = req.body.isbn;
    const result = await db.query(
      "INSERT INTO books (title, author, isbn) VALUES ($1, $2, $3)",
      [title, author, isbn]
    );
    return res.send(
      "<script>alert('Your book is added!') ; window.location='/'</script>"
    );
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
