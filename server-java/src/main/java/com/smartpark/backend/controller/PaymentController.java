package com.smartpark.backend.controller;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    private RazorpayClient razorpayClient;

    private synchronized RazorpayClient getRazorpayClient() throws Exception {
        if (razorpayClient == null) {
            razorpayClient = new RazorpayClient(keyId, keySecret);
        }
        return razorpayClient;
    }

    // POST /api/payment/create-order
    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> body) {
        try {
            double amount = Double.parseDouble(body.get("amount").toString());
            String currency = body.getOrDefault("currency", "INR").toString();
            String receipt = body.getOrDefault("receipt", "receipt_" + System.currentTimeMillis()).toString();

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", (int) (amount * 100)); // amount in paise
            orderRequest.put("currency", currency);
            orderRequest.put("receipt", receipt);

            Order order = getRazorpayClient().orders.create(orderRequest);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .body(order.toString());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to create payment order", "error", e.getMessage()));
        }
    }

    // POST /api/payment/verify
    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestBody Map<String, String> body) {
        try {
            String razorpayOrderId = body.get("razorpay_order_id");
            String razorpayPaymentId = body.get("razorpay_payment_id");
            String razorpaySignature = body.get("razorpay_signature");

            String payload = razorpayOrderId + "|" + razorpayPaymentId;
            String expectedSignature = calculateHmacSha256(payload, keySecret);

            boolean isAuthentic = expectedSignature.equals(razorpaySignature);

            if (isAuthentic) {
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "Payment verified successfully",
                        "paymentId", razorpayPaymentId,
                        "orderId", razorpayOrderId
                ));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("success", false, "message", "Payment verification failed"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // GET /api/payment/key
    @GetMapping("/key")
    public ResponseEntity<?> getPaymentKey() {
        return ResponseEntity.ok(Map.of("key", keyId));
    }

    private String calculateHmacSha256(String data, String key) throws Exception {
        SecretKeySpec signingKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(signingKey);
        byte[] rawHmac = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        StringBuilder result = new StringBuilder();
        for (byte b : rawHmac) {
            result.append(String.format("%02x", b));
        }
        return result.toString();
    }
}
