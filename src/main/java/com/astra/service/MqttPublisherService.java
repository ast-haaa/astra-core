package com.astra.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.eclipse.paho.client.mqttv3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.Map;

@Service
public class MqttPublisherService {

    private final String broker;
    private final String clientId;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public MqttPublisherService(
            @Value("${mqtt.broker}") String broker,
            @Value("${mqtt.clientId}") String clientId
    ) {
        this.broker = broker;
        this.clientId = clientId + "-" + System.currentTimeMillis();
    }

    // MAIN publish method: topic + JSON string
    public void publish(String topic, String jsonPayload) {
        try {
            MqttClient client = new MqttClient(broker, clientId + "-" + topic);
            MqttConnectOptions opts = new MqttConnectOptions();
            opts.setCleanSession(true);
            opts.setAutomaticReconnect(true);

            client.connect(opts);

            MqttMessage message = new MqttMessage(jsonPayload.getBytes(StandardCharsets.UTF_8));
            message.setQos(1);
            client.publish(topic, message);

            client.disconnect();
            client.close();

            System.out.println("MQTT PUBLISH [" + topic + "] " + jsonPayload);

        } catch (Exception e) {
            throw new RuntimeException("MQTT publish failed: " + e.getMessage(), e);
        }
    }

    // Overload for raw object → converted to JSON
    public void publish(String topic, Object payload) {
        try {
            String json = objectMapper.writeValueAsString(payload);
            publish(topic, json);
        } catch (Exception e) {
            throw new RuntimeException("MQTT publish failed (object): " + e.getMessage(), e);
        }
    }

    // For explicit command publishing
    public void publishCommand(String deviceId, Map<String, Object> payload) throws Exception {
        String topic = "boxes/" + deviceId + "/commands";
        publish(topic, payload);
    }
}
