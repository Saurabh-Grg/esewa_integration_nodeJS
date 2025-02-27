//index.js
const express = require("express");
const db = require('./db');  // Import the database connection
const { getEsewaPaymentHash, verifyEsewaPayment } = require("./esewa");
const Payment = require("./paymentModel");
const Item = require("./itemModel");
const PurchasedItem = require("./purchasedItemModel");

const bodyParser = require("body-parser");
const app = express();

const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
const { v4: uuidv4 } = require('uuid'); // Import the uuid library

app.post("/initialize-esewa", async (req, res) => {
    try {
      const { itemId, totalPrice } = req.body;
  
      // Validate item exists and the price matches
      const itemData = await Item.findOne({
        where: {
          itemId: itemId, // or any other primary key field name
          price: Number(totalPrice),
        },
        attributes: ['price'], // Only select the price field
      });
  
      if (!itemData) {
        console.log('Item not found or price mismatch');
        return res.status(400).send({
          success: false,
          message: "Item not found or price mismatch.",
        });
      }
  
      // Generate a UUID for purchasedItemId
      const purchasedItemId = uuidv4();  // Create a unique UUID for purchasedItemId
  
      // Create a record for the purchase with the UUID
      const purchasedItemData = await PurchasedItem.create({
        purchasedItemId: purchasedItemId, // Store the UUID as purchasedItemId
        itemId: itemId,
        paymentMethod: "esewa",
        totalPrice: totalPrice,
      });
  
      // Use the generated UUID as transaction UUID
      const transactionUuid = purchasedItemData.purchasedItemId;  // Use the UUID generated for the purchase
  
      console.log("Transaction UUID:", transactionUuid);
  
      // Initiate payment with eSewa
      const paymentInitiate = await getEsewaPaymentHash({
        amount: totalPrice,
        transaction_uuid: transactionUuid,
      });
  
      // Respond with payment details
      res.json({
        success: true,
        payment: paymentInitiate,
        purchasedItemData,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });


//   app.get("/complete-payment", async (req, res) => {
//     const { data } = req.query; // Data received from eSewa's redirect
  
//     try {
//       // Verify payment with eSewa
//       const paymentInfo = await verifyEsewaPayment(data);
  
//       // Find the purchased item using the transaction UUID
//       const purchasedItemData = await PurchasedItem.findByPk(
//         paymentInfo.response.transaction_uuid
//       );
  
//       if (!purchasedItemData) {
//         return res.status(500).json({
//           success: false,
//           message: "Purchase not found",
//         });
//       }
  
//       // Create a new payment record in the database
//       const paymentData = await Payment.create({
//         pidx: paymentInfo.decodedData.transaction_code,
//         transactionId: paymentInfo.decodedData.transaction_code,
//         productId: paymentInfo.response.transaction_uuid,
//         amount: purchasedItemData.totalPrice,
//         dataFromVerificationReq: paymentInfo,
//         apiQueryFromUser: req.query,
//         paymentGateway: "esewa",
//         status: "success",
//         purchasedItemId: paymentInfo.response.transaction_uuid, // Ensure this field is set
//       });
  
//       // Update the purchased item status to 'completed'
//     await PurchasedItem.update(
//         { status: "completed" },
//         { where: { purchasedItemId: paymentInfo.response.transaction_uuid } }
//       );
  
  
//       // Respond with success message
//       res.json({
//         success: true,
//         message: "Payment successful",
//         paymentData,
//       });
//     } catch (error) {
//       res.status(500).json({
//         success: false,
//         message: "An error occurred during payment verification",
//         error: error.message,
//       });
//     }
//   });

app.get("/complete-payment", async (req, res) => {
    const { data } = req.query; // Data received from eSewa's redirect

    try {
        console.log("Received data from eSewa:", data);

        // Verify payment with eSewa
        const paymentInfo = await verifyEsewaPayment(data);
        console.log("Payment verification response:", paymentInfo);

        // Extract transaction UUID
        const transactionUuid = paymentInfo.response.transaction_uuid;
        console.log("Extracted Transaction UUID:", transactionUuid);

        if (!transactionUuid) {
            console.error("Transaction UUID is missing from eSewa response");
            return res.status(400).json({ success: false, message: "Invalid transaction UUID" });
        }

        // Find the purchased item using the transaction UUID
        const purchasedItemData = await PurchasedItem.findByPk(transactionUuid);
        console.log("Fetched Purchased Item Data:", purchasedItemData);

        if (!purchasedItemData) {
            console.error("No matching PurchasedItem found for UUID:", transactionUuid);
            return res.status(500).json({ success: false, message: "Purchase not found" });
        }

        // Prepare the data to be inserted into Payment table
        const paymentData = {
            pidx: paymentInfo.decodedData.transaction_code,
            transactionId: paymentInfo.decodedData.transaction_code,
            // productId: transactionUuid,
            amount: purchasedItemData.totalPrice,
            dataFromVerificationReq: paymentInfo,
            apiQueryFromUser: req.query,
            paymentGateway: "esewa",
            status: "success",
            purchasedItemId: purchasedItemData.purchasedItemId,// Ensuring this field is set
        };

        console.log("Data to be inserted into Payment table:", paymentData);

        // Create a new payment record in the database
        const paymentRecord = await Payment.create(paymentData);
        console.log("Inserted Payment Record:", paymentRecord);

        // Update the purchased item status to 'completed'
        await PurchasedItem.update({ status: "completed" }, { where: { purchasedItemId: transactionUuid } });

        // Respond with success message
        res.json({ success: true, message: "Payment successful", paymentRecord });

    } catch (error) {
        console.error("Error during payment verification:", error);
        res.status(500).json({ success: false, message: "An error occurred during payment verification", error: error.message });
    }
});



if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/test.html");
  });

app.listen(3001, () => {
  console.log("Backend listening at http://localhost:3001");
});