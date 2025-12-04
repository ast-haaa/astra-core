package com.astra.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class OtpService {

    @Value("${otp.sms.apiKey:dummy}")
    private String smsApiKey;

    @Value("${otp.email.apiKey:dummy}")
    private String emailApiKey;

    @Value("${email.from:no-reply@herbtrace.local}")
    private String fromEmail;

    private final RestTemplate restTemplate = new RestTemplate();

    // Memory store (mobile/email → OTP)
    private final Map<String, String> otpStore = new ConcurrentHashMap<>();

    /* ----------------------------------------------------
     * 1) SEND OTP (SMS or EMAIL)
     * ---------------------------------------------------- */
    public void sendOtp(String identifier) {

        String otp = generateOtp();
        otpStore.put(identifier, otp);

        if (identifier.contains("@")) {
            // email login
            sendEmailOtp(identifier, otp);
        } else {
            // mobile login
            sendSmsOtp(identifier, otp);
        }
    }

    /* ----------------------------------------------------
     * 2) VERIFY OTP
     * ---------------------------------------------------- */
    public boolean verify(String identifier, String otp) {
        String stored = otpStore.get(identifier);

        if (stored != null && stored.equals(otp)) {
            otpStore.remove(identifier);
            return true;
        }

        return false;
    }

    /* ----------------------------------------------------
     * INTERNAL: Generate 6-digit OTP
     * ---------------------------------------------------- */
    private String generateOtp() {
        return String.valueOf((int) (Math.random() * 900000) + 100000);
    }

    /* ----------------------------------------------------
     * SMS OTP  (for now: console log, later integrate 2Factor)
     * ---------------------------------------------------- */
    private void sendSmsOtp(String mobile, String otp) {
        // Abhi ke liye sirf console me show kar rahe hain:
        System.out.println("📩 [DEV] SMS OTP to " + mobile + " = " + otp);

        // Agar baad me 2Factor integrate karna ho, yahan se kar sakte ho.
        // Example (template based):
        /*
        try {
            String url = "https://2factor.in/API/V1/" + smsApiKey
                       + "/SMS/" + mobile + "/" + otp;
            restTemplate.getForObject(url, String.class);
        } catch (Exception e) {
            throw new RuntimeException("SMS OTP failed: " + e.getMessage());
        }
        */
    }

    /* ----------------------------------------------------
     * EMAIL OTP using SendGrid
     * ---------------------------------------------------- */
    private void sendEmailOtp(String toEmail, String otp) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(emailApiKey);

            String body = """
                {
                  "personalizations": [{
                    "to": [{"email": "%s"}],
                    "subject": "Your HerbTrace OTP"
                  }],
                  "from": {"email": "%s"},
                  "content": [{
                    "type": "text/plain",
                    "value": "Your OTP is %s"
                  }]
                }
                """.formatted(toEmail, fromEmail, otp);

            HttpEntity<String> req = new HttpEntity<>(body, headers);

            restTemplate.postForObject(
                    "https://api.sendgrid.com/v3/mail/send",
                    req,
                    String.class
            );

            System.out.println("📧 Email OTP sent to " + toEmail);

        } catch (Exception e) {
            throw new RuntimeException("Email OTP failed: " + e.getMessage());
        }
    }
}
