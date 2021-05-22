const express=require("express");
const ejs=require("ejs");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const date=require(__dirname+"/date.js");
const _=require("lodash");

const app=express();
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));
mongoose.connect('mongodb://localhost:27017/todolistDB', {useNewUrlParser: true, useUnifiedTopology: true});
// var items=[];
// var workitems=[];
const itemSchema = {
    name:  String
     };
const Item = mongoose.model('Item', itemSchema);
const item1=new Item({
    name:"Cook Food"
});
const item2=new Item({
    name:"Eat Food"
});
const item3=new Item({
    name:"Buy Food"
});
const defaultItems=[item1,item2,item3];

//ListSchema
const listSchema={
    name:String,
    items:[itemSchema]
}
const List = mongoose.model('List', listSchema);

var day=date.getDate();
app.get("/",function(req,res){
    Item.find({},function(err,foundItems){
        if(foundItems.length===0){
            Item.insertMany(defaultItems,function(err){
                if(err){
                    console.log("Items not inserted");
                }
                else{
                    console.log("saved default items to DB");
                }
            });
            
            res.redirect("/");
        }
        else{
            res.render("list",{kindOfDay:day,items:foundItems});
        }
        
    });
   
});

app.post("/",function(req,res){
    itemName=req.body.val1;
    btn=req.body.btn;

    const item=new Item({
        name:itemName
    });
    if(btn===day){
        item.save();
    res.redirect("/");
    }
    else{
        List.findOne({name:btn},function(err,foundItem){
            foundItem.items.push(item);
            foundItem.save();
            res.redirect("/"+btn);
        });
    }
    
});
app.get("/:customListName",function(req,res){
    const listName=_.capitalize(req.params.customListName);
    List.findOne({name:listName},function(err,foundList){
        if(!err){
            if(foundList){
                //show an existing list
                res.render("list",{kindOfDay:listName,items:foundList.items});
            }
            else{
                //create  a new list
        const item=new List({
            name:listName,
            items:defaultItems
        });
        item.save();
        res.redirect("/"+listName);
    }
    }
    else{
        console.log("error occured");
    }
    });
    
});
app.post("/delete",function(req,res){
  const itemdelete=req.body.checkbox;
  const listName=req.body.listName;
  if(listName===day){
    Item.findByIdAndRemove(itemdelete,function(err){
        if(err){
            console.log("error");
        }
        else{
          res.redirect("/");
        }
    });
  }
  else{
      List.findOneAndUpdate({name:listName},{$pull:{items:{_id:itemdelete}}},function(err,foundList){
          if(!err){
            res.redirect("/"+listName);
          }
      });
  }
  
 
});
app.listen(3000,function(){
    console.log("Server started at port 3000");
});