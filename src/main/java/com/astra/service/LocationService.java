package com.astra.service;

import com.astra.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Service
public class LocationService {

    private final String apiKey;
    private final RestTemplate restTemplate;

    @Autowired
    private EventRepository eventRepository;

    public LocationService(@Value("${opencage.api-key}") String apiKey) {
        this.apiKey = apiKey;
        this.restTemplate = new RestTemplate();
    }

    public String getLocationLabel(Double lat, Double lon) {
        try {
            if (lat == null || lon == null) return "Location Unknown";

            String url = "https://api.opencagedata.com/geocode/v1/json?q="
                    + URLEncoder.encode(lat + "," + lon, StandardCharsets.UTF_8)
                    + "&key=" + apiKey;

            Map response = restTemplate.getForObject(url, Map.class);

            if (response == null || !response.containsKey("results"))
                return "Location Unknown";

            var results = (java.util.List<Map>) response.get("results");
            if (results.isEmpty()) return "Location Unknown";

            Map first = results.get(0);
            Map components = (Map) first.get("components");

            if (components.get("city") != null) return components.get("city").toString();
            if (components.get("town") != null) return components.get("town").toString();
            if (components.get("village") != null) return components.get("village").toString();
            if (components.get("state") != null) return components.get("state").toString();
            if (components.get("country") != null) return components.get("country").toString();

            return "Location Unknown";

        } catch (Exception e) {
            return "Location Unknown";
        }
    }

    public String getLatestPeltierState(String boxId) {
        try {
            return eventRepository.findLatestPeltierEvent(boxId)
                    .map(e -> e.getType())
                    .map(t ->
                            t.equalsIgnoreCase("peltier_on") ? "ON" :
                            t.equalsIgnoreCase("peltier_off") ? "OFF" : "UNKNOWN"
                    )
                    .orElse("UNKNOWN");
        } catch (Exception e) {
            return "UNKNOWN";
        }
    }
}
