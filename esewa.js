//esewa.js
const axios = require("axios");
const crypto = require("crypto");

async function getEsewaPaymentHash({ amount, transaction_uuid }) {
    try {
      // Construct the data string as per eSewa's requirements
      const data = `total_amount=${amount},transaction_uuid=${transaction_uuid},product_code=${process.env.ESEWA_PRODUCT_CODE}`;
      
      // Log the data you're signing
      console.log("Data to be signed:", data);
  
      const secretKey = process.env.ESEWA_SECRET_KEY;
      const hash = crypto
        .createHmac("sha256", secretKey)
        .update(data)
        .digest("base64");
  
      // Log the generated hash
      console.log("Generated hash (signature):", hash);
  
      return {
        signature: hash,
        signed_field_names: "total_amount,transaction_uuid,product_code",
      };
    } catch (error) {
      console.error("Error in generating eSewa payment hash:", error);
      throw error;
    }
  }
  
  async function verifyEsewaPayment(encodedData) {
    try {
      // Decode the base64 data received from eSewa
      let decodedData = atob(encodedData);
      decodedData = await JSON.parse(decodedData);
  
      // Log the decoded data
      console.log("Decoded Data from eSewa:", decodedData);
  
      let headersList = {
        Accept: "application/json",
        "Content-Type": "application/json",
      };
  
      // Construct the data string for signature verification
      const data = `transaction_code=${decodedData.transaction_code},status=${decodedData.status},total_amount=${decodedData.total_amount},transaction_uuid=${decodedData.transaction_uuid},product_code=${process.env.ESEWA_PRODUCT_CODE},signed_field_names=${decodedData.signed_field_names}`;
  
      // Log the data being signed for verification
      console.log("Data for signature verification:", data);
  
      // Generate the hash to compare with eSewa's signature
      const secretKey = process.env.ESEWA_SECRET_KEY;
      const hash = crypto
        .createHmac("sha256", secretKey)
        .update(data)
        .digest("base64");
  
      // Log the generated hash for comparison
      console.log("Generated hash (verification):", hash);
  
      // Log the signature received from eSewa
      console.log("Signature from eSewa:", decodedData.signature);
  
      // Compare the hashes
      if (hash !== decodedData.signature) {
        console.error("Signature mismatch!");
        throw { message: "Invalid Info", decodedData };
      }
  
      // Make the API request to check payment status
      let reqOptions = {
        url: `${process.env.ESEWA_GATEWAY_URL}/api/epay/transaction/status/?product_code=${process.env.ESEWA_PRODUCT_CODE}&total_amount=${decodedData.total_amount}&transaction_uuid=${decodedData.transaction_uuid}`,
        method: "GET",
        headers: headersList,
      };
  
      let response = await axios.request(reqOptions);
  
      // Log the response from eSewa's status check
      console.log("eSewa Payment Status Response:", response.data);
  
      if (
        response.data.status !== "COMPLETE" ||
        response.data.transaction_uuid !== decodedData.transaction_uuid ||
        Number(response.data.total_amount) !== Number(decodedData.total_amount)
      ) {
        console.error("Payment verification failed");
        throw { message: "Invalid Info", decodedData };
      }
  
      return { response: response.data, decodedData };
    } catch (error) {
      console.error("Error in verifying eSewa payment:", error);
      throw error;
    }
  }

  module.exports = { verifyEsewaPayment, getEsewaPaymentHash };