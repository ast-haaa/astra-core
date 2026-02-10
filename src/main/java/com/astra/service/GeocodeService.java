package com.astra.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
public class GeocodeService {

    @Value("${OPENCAGE_API_KEY:}")
    private String apiKey;

    private final RestTemplate rest = new RestTemplate();

    @Cacheable(value = "geocodeCache", key = "#lat + '-' + #lng")
    public String reverse(double lat, double lng) {
        if (apiKey == null || apiKey.isBlank()) return "";
        try {
            String q = URLEncoder.encode(lat + "," + lng, StandardCharsets.UTF_8);
            String url = "https://api.opencagedata.com/geocode/v1/json?q=" + q + "&key=" + apiKey + "&no_annotations=1&pretty=0";
            @SuppressWarnings("unchecked")
            Map<String, Object> resp = rest.getForObject(url, Map.class);
            if (resp == null) return "";
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> results = (List<Map<String, Object>>) resp.get("results");
            if (results == null || results.isEmpty()) return "";
            Object formatted = results.get(0).get("formatted");
            return formatted == null ? "" : formatted.toString();
        } catch (Exception e) {
            return "";
        }
    }
}
