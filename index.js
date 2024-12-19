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

let currentBook=2;

let items=[];
let quotes=[];
let testtt=0;
let editId=0;

async function getCurrentList() {
    const result = await db.query("SELECT * FROM books order by id asc");
    items = result.rows;
    return items.find((item) => item.id == currentBook);
  }

 async function getCurrentNotes() {
    const result= await db.query("SELECT * FROM booknotes where book_id=($1)", [currentBook]);
    quotes= result.rows;
    
 } 

 async function updateCurrentNote (){
    const result=await db.query("")
 }


// homepages- presents all the notes stored
app.get("/", async  (req, res) => {
  const input= await getCurrentList();
  const input2=await getCurrentNotes();
  res.render("index.ejs", {items:items, 
    currentBook:currentBook, 
    quotes:quotes,
    id:input, 
    test:testtt,
    editId:editId
});
//   console.log(items);
//   console.log(quotes);
//   console.log(input);
});

// Displays selected book's quotes
app.post("/item", async (req, res) => {
    let currentId= req.body.item;
    currentBook=currentId;
   res.redirect ("/");

  
});

// choose to edit or delete selected quote
app.post("/menu", async (req, res) => {
    testtt=req.body.selectpicker;
    editId= req.body.id;
    
    // console.log(testtt);
    // console.log(editId);
    console.log(req.body);
    
    res.redirect ("/");
    

});

// Edit a selected quote
app.post("/update", async (req, res) => {
    let testtt2=req.body;
    const id = parseInt(req.body.index);
    
    console.log(id);
    console.log(req.body);
   
    

});

// Delete a selected quote
app.post("/delete", async (req, res) => {


});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
