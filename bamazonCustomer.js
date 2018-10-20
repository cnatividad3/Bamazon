//require
const inquirer = require("inquirer");
const mysql = require("mysql");
const Table = require('easy-table');

//connection
const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "bamazon_DB"
});

//connect
connection.connect(function(err){
  if (err) throw err;
  console.log(`you are now connected to ${connection.threadId}`);
  showProducts();
});

//display products
function showProducts(){
  connection.query("SELECT * FROM products", function(err, items){
    if (err) throw err;
//easy-table
    const t = new Table;
    items.forEach(function (product) {
      t.cell('Product Id', product.item_id)
      t.cell('Product Name', product.product_name)
      t.cell('Department Name', product.department_name)
      t.cell('Price', product.price, Table.number(2))
      t.cell('Quantity', product.stock_quantity)
      t.newRow()
    })
    
    console.log(`
==========================================================================
                              Our Products
==========================================================================
${t.toString()}`);
    pickProducts();
  });

};

// function to choose product to buy
function pickProducts(){
  connection.query("SELECT * FROM products", function(err, items){
    if (err) throw err;
//inquirer
    inquirer
    .prompt([{
        name: "ID",
        message: "Please enter ID of desired item",
        type: "input",
        default: 1
      },
      {
        name: "quantity",
        message: "How many would you like to purchase?",
        type: "input",
        default: 1,
      }
    ]).then(function(itemInfo){
      
      const chosenItem = items.find(function(item){
        return item.item_id === parseFloat(itemInfo.ID)
      });

      //check quantitiy
      if (itemInfo.quantity > chosenItem.stock_quantity) {
        console.log("Insufficient quantity!");
        pickProducts();
      } else {
        let updateStock = chosenItem.stock_quantity - itemInfo.quantity;
        let totalCost = chosenItem.price * itemInfo.quantity;
        console.log(`Item added to bag. Cost: $${totalCost}`);
        purchasedItem(chosenItem.item_id, updateStock);
      };

    });
  });
};


// use to check the quantity of an item
const purchasedItem = function(itemId, quantity){
  connection.query("UPDATE products SET ? WHERE ?", [{
      stock_quantity: parseFloat(quantity)
    },
    {
      item_id: itemId
    }
  ], function(err, res){
    if (err) throw err;
    console.log("thank you for you purchase!")
    showProducts();
  })
}