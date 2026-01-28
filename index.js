const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();

// app.get(path, callback)
const products = [
  {
    prodName: "charger",
    prodPrice: 20,
    prodQuantity: 15,
    prodDescription: "Fast charging USB-C wall charger",
  },
  {
    prodName: "wireless earbuds",
    prodPrice: 89.99,
    prodQuantity: 42,
    prodDescription: "Noise-cancelling Bluetooth earbuds with charging case",
  },
  {
    prodName: "laptop stand",
    prodPrice: 34.5,
    prodQuantity: 28,
    prodDescription: "Adjustable aluminum laptop stand for ergonomic setup",
  },
  {
    prodName: "mechanical keyboard",
    prodPrice: 119.99,
    prodQuantity: 17,
    prodDescription: "RGB mechanical keyboard with Cherry MX switches",
  },
  {
    prodName: "smart watch",
    prodPrice: 249.99,
    prodQuantity: 8,
    prodDescription: "Fitness tracker with heart rate monitor and GPS",
  },
  {
    prodName: "webcam",
    prodPrice: 75.25,
    prodQuantity: 56,
    prodDescription: "1080p HD webcam with built-in microphone",
  },
  {
    prodName: "power bank",
    prodPrice: 45.99,
    prodQuantity: 33,
    prodDescription: "20000mAh portable power bank with multiple ports",
  },
  {
    prodName: "desk lamp",
    prodPrice: 29.99,
    prodQuantity: 21,
    prodDescription:
      "LED desk lamp with adjustable brightness and color temperature",
  },
  {
    prodName: "external SSD",
    prodPrice: 129.99,
    prodQuantity: 12,
    prodDescription: "1TB USB 3.2 external solid state drive",
  },
  {
    prodName: "gaming mouse",
    prodPrice: 59.95,
    prodQuantity: 39,
    prodDescription: "Programmable gaming mouse with RGB lighting",
  },
];
app.get("/", (req, res) => {
  // res.send(true)
  // res.send(['pampam', 'nony', ])
//   res.send(products)

console.log(__dirname);
res.sendFile(__dirname+"/index.html")

});

// app.listen(port, callback)
app.listen(process.env.PORT, (err) => {
  if (err) {
    console.log("error starting server", err);
  } else {
    console.log(`server started successfully`);
  }
});
