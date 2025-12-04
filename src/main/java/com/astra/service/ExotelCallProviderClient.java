package com.astra.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriUtils;

import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
public class ExotelCallProviderClient implements CallProviderClient {

    @Value("${exotel.accountSid}")
    private String accountSid;

    @Value("${exotel.apiKey}")
    private String apiKey;

    @Value("${exotel.apiToken}")
    private String apiToken;

    @Value("${exotel.fromNumber}")
    private String fromNumber;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public void makeCall(String phone, String message) {

        String encodedMessage = UriUtils.encode(message, StandardCharsets.UTF_8);
        String ttsUrl = "https://your-domain.com/api/voice/alert?msg=" + encodedMessage;

        String url = "https://api.exotel.com/v1/Accounts/" + accountSid + "/Calls/connect";

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("From", fromNumber);
        body.add("To", phone);
        body.add("CallerId", fromNumber);
        body.add("Url", ttsUrl);

        HttpHeaders headers = new HttpHeaders();
        headers.setBasicAuth(apiKey, apiToken);
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(body, headers);

        try {
            restTemplate.postForEntity(url, entity, String.class);
            System.out.println("📞 Exotel call triggered → " + phone);
        } catch (Exception e) {
            System.out.println("❌ Exotel call failed: " + e.getMessage());
        }
    }
}
