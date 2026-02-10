package com.astra.util;

import com.astra.model.User;
import org.springframework.stereotype.Component;

@Component
public class JwtUtil {

    // ----------------------------------------------------
    // Generate new token
    // ----------------------------------------------------
    public String generateToken(User user) {
        if (user == null || user.getId() == null) {
            throw new RuntimeException("Cannot generate token: user null");
        }

        long ts = System.currentTimeMillis();
        return "herb-" + user.getId() + "-" + ts;
    }

    // ----------------------------------------------------
    // Refresh existing token
    // ----------------------------------------------------
    public String refreshToken(String oldToken) {

        if (oldToken == null || oldToken.isBlank()) {
            throw new RuntimeException("Invalid token");
        }

        // Simply generate new timestamp-based token
        long ts = System.currentTimeMillis();

        // If you want to extract userId from old token:
        // Format: herb-<userId>-<oldTime>
        String[] parts = oldToken.split("-");
        if (parts.length < 3) {
            throw new RuntimeException("Malformed token");
        }

        String userId = parts[1];
        return "herb-" + userId + "-" + ts;
    }
}
