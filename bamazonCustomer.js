const inquirer = require("inquirer");
const mysql = require("mysql");


const db = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "bamazon_DB"
});

db.connect(function(err){
  if (err) throw err;
  console.log(`Connected on ${db.threadId}`);
  showProducts();
});

function showProducts(){
  db.query("SELECT * FROM products", function(err, items){
    if (err) throw err;
    console.log(items);
    pickProduct();
  });

};

// chosen product to buy
function pickProduct(){
  db.query("SELECT * FROM products", function(err, items){
    if (err) throw err;

    inquirer
    
    .prompt([
      {
        name: "itemID",
        message: "What item would you like to purchase (please enter item ID)?",
        type: "input",
        default: 1
      },
      {
        name: "quantity",
        message: "How many do you want?",
        type: "input",
        default: 1
      }
    ]).then(function(productInfo) {
      const selectedItem = items.find(item => item.item_id === productInfo.itemID);

      if (productInfo.quantity > selectedItem.stock_quantity) {
        console.log("Insufficient quantity!");
        pickProduct();
      } else {
        let updateQuantity = selectedItem.stock_quantity - productInfo.quantity;
        let totalCost = selectedItem.price * productInfo.quantity;
        console.log(`Purchase successful! Your total cost: ${totalCost}`);
        purchasedItem(selectedItem.item_id, updateQuantity);
      };

    })
  });
};

// check quantity
const purchasedItem = function(itemId, quantity){
  db.query("UPDATE products SET ? WHERE ?", [
    {
      stock_quantity: parseFloat(quantity)
    },
    {
      item_id: itemId
    }
  ], function(err, res) {
    if (err) throw err;
    console.log("Look for another item!")
    pickProduct();
  })
}