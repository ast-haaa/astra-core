package com.astra.service;

import lombok.extern.slf4j.Slf4j;
import org.eclipse.paho.client.mqttv3.*;
import org.eclipse.paho.client.mqttv3.persist.MemoryPersistence;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.UUID;
import java.util.Map;

@Service
@Slf4j
public class ActuatorService {

    private final MqttClient client;

    public ActuatorService(
            @Value("${mqtt.broker:tcp://localhost:1883}") String brokerUrl
    ) throws MqttException {

        String clientId = "astra-actuator-" + UUID.randomUUID().toString().substring(0, 8);

        log.info("⚙️ Actuator MQTT connecting → {} (clientId={})", brokerUrl, clientId);

        this.client = new MqttClient(brokerUrl, clientId, new MemoryPersistence());

        MqttConnectOptions opts = new MqttConnectOptions();
        opts.setAutomaticReconnect(true);
        opts.setCleanSession(true);

        this.client.connect(opts);

        log.info("✅ Actuator MQTT connected");
    }

    /**
     * Turn Peltier ON/OFF for a box.
     */
    public void setPeltier(String boxId, boolean on) {
        try {
            if (!client.isConnected()) {
                log.warn("Actuator MQTT not connected, reconnecting...");
                client.reconnect();
            }

            String topic = "boxes/" + boxId + "/cmd";

            String payload = "{\"peltier\":\"" + (on ? "on" : "off") + "\"}";

            log.info("📤 Publishing actuator cmd topic={} payload={}", topic, payload);

            MqttMessage msg = new MqttMessage(payload.getBytes(StandardCharsets.UTF_8));
            msg.setQos(1);

            client.publish(topic, msg);

            log.info("✅ Actuator cmd published");

        } catch (Exception e) {
            log.error("❌ MQTT publish failed in ActuatorService: {}", e.getMessage(), e);
        }
    }
}
