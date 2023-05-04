//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose=require("mongoose");
const _=require("lodash");
const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-anish:anish26@atlascluster.bzk4q3k.mongodb.net/todolistDB",{useNewUrlParser:true,useUnifiedTopology: true });

const itemsSchema={
  name: String
};

const Item=mongoose.model("item",itemsSchema);

const item1=new Item({
  name:"reading"
});

const item2=new Item({
  name:"writing"
});

const item3=new Item({
  name:"playing"
});

const defaultItems=[item1,item2,item3];

const listSchema={
  name:String,
  items:[itemsSchema]
};

const List=mongoose.model("list",listSchema);




app.get("/", function(req, res) {
  Item.find({},function(err,foundItems){
    if(foundItems.length===0){
      Item.insertMany(defaultItems,function(err){
        if(err)
         console.log(err);
        else 
         console.log("successfully inserted default items");
      })
      res.redirect("/");
    }
    else
      res.render("list", {listTitle: "Today", newListItems: foundItems});
  });   
});

app.get("/:custlistname",function(req,res){
  const custlistname=_.capitalize(req.params.custlistname);
  List.findOne({name:custlistname},function(err,foundList){
    if(!err){
    if(!foundList)
    {
      const list=new List({
        name:custlistname,
        items:defaultItems
      });
      list.save();
      res.redirect("/"+custlistname);
    }
    else{
      res.render("list",{listTitle:custlistname,newListItems:foundList.items});
    }
  }
  })
});

app.post("/", function(req, res){
  const itemName=req.body.newItem;
  const listName=req.body.list;
  const item = new Item({
     name: itemName
  });
  if(listName==="Today"){
   item.save();
   res.redirect("/");
  }
  else{
    List.findOne({name:listName},function(err,foundList){
      if(!err){
        foundList.items.push(item);
        foundList.save();
        res.redirect("/"+listName);
      }
    })
  }
 
});

app.post("/delete",function(req,res){
  const checkid=(req.body.checkbox);
  const listName=(req.body.listName);
  if(listName==="Today"){
  Item.findByIdAndRemove(checkid,function(err){
    if(err){
      console.log(err);
    }
    else 
     console.log("deleted succesfully");
  });
  res.redirect("/");
}
else{
  List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkid}}},function(err,foundList){
     if(!err){
      res.redirect("/"+listName);
     }
  });
}
});


let port=process.env.PORT;
if(port==null||port=="")
 port=3000;
app.listen(port, function() {
  console.log("Server started successfully");
});
