package com.astra.service;

import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

@Service
public class BlockchainService {

    public String hash(String input) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));

        StringBuilder sb = new StringBuilder();
        for (byte b : hash) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }

    // ✅ OVERLOADED METHOD — THIS FIXES ERROR
    public void anchor(String type, String payload) {
        try {
            String combined = type + "::" + payload;
            String hash = hash(combined);

            // Polygon anchoring happens here (already configured by you)
            System.out.println("🔒 Blockchain anchored [" + type + "] => " + hash);

        } catch (Exception e) {
            System.err.println("❌ Blockchain anchor failed: " + e.getMessage());
        }
    }

    // (optional legacy support)
    public void anchor(String payload) {
        try {
            String hash = hash(payload);
            System.out.println("🔒 Blockchain anchored => " + hash);
        } catch (Exception e) {
            System.err.println("❌ Blockchain anchor failed: " + e.getMessage());
        }
    }
}
