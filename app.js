//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-matheus:" + password + "@cluster0.hltzoqy.mongodb.net/todolistDB");

// --------------- Mongoose DB ----------------

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item ({
  name: "Welcome to your todolist!"
});

const item2 = new Item ({
  name: "Hit the + button to add a new item."
});

const item3 = new Item ({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model("List", listSchema);

// --------------- Mongoose DB ----------------

app.get("/", function(req, res) {
  Item.find({}, function(err, items) {
    if (err)
      console.log(err);
    else {
      if (items.length === 0) {
        Item.insertMany(defaultItems, function(err) {
          if (err)
            console.log(err);
          else
            console.log("Successfully saved default items to DB.");
        });
        res.redirect("/");
      } else
          res.render("list", {listTitle: "Today", newListItems: items});
    }
  });
});

app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        //Create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });

        list.save(function(err, result) {
          res.redirect("/" + customListName);
        });
      } else {
        //Show an existing list
        res.render("list", {listTitle: customListName, newListItems: foundList.items});
      }
    }
  });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save(function(err, result) {
        res.redirect("/" + listName);
      });
    });
  }
});

app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.deleteOne({_id: checkedItemId}, function(err) {
      if (err)
        console.log(err);
      else
        console.log("The item with the " + checkedItemId + " id has been successfully deleted.");
        res.redirect("/");
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList) {
      if (!err)
        res.redirect("/" + listName);
    });
  }
});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port successfully");
});
