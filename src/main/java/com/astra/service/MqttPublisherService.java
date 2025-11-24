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

    public void publishCommand(String deviceId, Map<String, Object> payload) throws Exception {
        String topic = "boxes/" + deviceId + "/commands";
        String json = objectMapper.writeValueAsString(payload);

        MqttClient client = new MqttClient(broker, clientId + "-" + deviceId);
        MqttConnectOptions opts = new MqttConnectOptions();
        opts.setAutomaticReconnect(true);
        opts.setCleanSession(true);
        client.connect(opts);

        MqttMessage msg = new MqttMessage(json.getBytes(StandardCharsets.UTF_8));
        msg.setQos(1);
        client.publish(topic, msg);
        client.disconnect();
        client.close();
    }
}
