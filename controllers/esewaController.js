const { getEsewaPaymentHash, verifyEsewaPayment } = require("../esewa/esewa");
const { v4: uuidv4 } = require("uuid");
const Item = require("../models/itemModel");
const PurchasedItem = require("../models/purchasedItemModel");
const Payment = require("../models/paymentModel");

const initializePayment = async (req, res) => {
  try {
    const { itemId, totalPrice } = req.body;

    // Validate item exists and price matches
    const itemData = await Item.findOne({
      where: { itemId, price: Number(totalPrice) },
      attributes: ['price'],
    });

    if (!itemData) {
      return res.status(400).send({
        success: false,
        message: "Item not found or price mismatch.",
      });
    }

    // Create purchase record with UUID
    const purchasedItemId = uuidv4();
    const purchasedItemData = await PurchasedItem.create({
      purchasedItemId,
      itemId,
      paymentMethod: "esewa",
      totalPrice,
    });

    // Initiate payment with eSewa
    const paymentInitiate = await getEsewaPaymentHash({
      amount: totalPrice,
      transaction_uuid: purchasedItemData.purchasedItemId,
    });

    res.json({
      success: true,
      payment: paymentInitiate,
      purchasedItemData,
      // commission_amount: commissionAmount,
      // amount_with_commission: totalPriceWithCommission
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};


const completePayment = async (req, res) => {
  const { data } = req.query;

  try {
    console.log("🔹 Received payment completion request:", data); // Debugging log

    // Verify payment with eSewa
    const paymentInfo = await verifyEsewaPayment(data);
    console.log("✅ eSewa verification response:", paymentInfo); // Debugging log

    const transactionUuid = paymentInfo.response.transaction_uuid;
    if (!transactionUuid) {
      console.error("❌ Invalid transaction UUID received!");
      return res.status(400).json({ success: false, message: "Invalid transaction UUID" });
    }

    // Fetch the purchased item
    const purchasedItemData = await PurchasedItem.findByPk(transactionUuid);
    if (!purchasedItemData) {
      console.error("❌ No matching purchase found for UUID:", transactionUuid);
      return res.status(404).json({ success: false, message: "Purchase not found" });
    }

    console.log("🔹 Found purchase record:", purchasedItemData.dataValues); // Debugging log

    // Check if payment was successful
    if (paymentInfo.response.status !== "COMPLETE") {
      console.error("❌ Payment verification failed! Deleting purchased item...");

      // Delete the failed payment record
      await PurchasedItem.destroy({ where: { purchasedItemId: transactionUuid } });
      console.log("✅ Deleted failed purchase record:", transactionUuid);

      return res.status(400).json({ success: false, message: "Payment verification failed, purchase record deleted" });
    }

    console.log("✅ Payment verified successfully!");

    // Save payment details
    const paymentData = {
      pidx: paymentInfo.decodedData.transaction_code,
      transactionId: paymentInfo.decodedData.transaction_code,
      amount: purchasedItemData.totalPrice,
      dataFromVerificationReq: paymentInfo,
      apiQueryFromUser: req.query,
      paymentGateway: "esewa",
      status: "success",
      purchasedItemId: purchasedItemData.purchasedItemId,
    };

    const paymentRecord = await Payment.create(paymentData);
    console.log("✅ Payment record saved:", paymentRecord.dataValues);

    // Update purchase status to completed
    await PurchasedItem.update({ status: "completed" }, { where: { purchasedItemId: transactionUuid } });
    console.log("✅ Purchase status updated to 'completed'");

    res.json({ success: true, message: "Payment successful", paymentRecord });

  } catch (error) {
    console.error("❌ Error during payment verification:", error);

    // Try to delete the purchased item if it exists
    if (req.query.transaction_uuid) {
      await PurchasedItem.destroy({ where: { purchasedItemId: req.query.transaction_uuid } });
      console.log("✅ Deleted purchase record due to an error:", req.query.transaction_uuid);
    }

    res.status(500).json({
      success: false,
      message: "An error occurred during payment verification",
      error: error.message,
    });
  }
};

module.exports = { initializePayment, completePayment };