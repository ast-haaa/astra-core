package com.astra.service;

import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.eclipse.paho.client.mqttv3.persist.MemoryPersistence;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.UUID;

@Service
public class ActuatorService {

    @Value("${mqtt.broker.url:tcp://mosquitto:1883}")
    private String brokerUrl;

    private final JdbcTemplate jdbc;

    // a tiny publisher client, created lazily to avoid bean cycles
    private volatile MqttClient pubClient;

    public ActuatorService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public void setPeltier(String boxId, boolean on) {
        String topic = "boxes/" + boxId + "/cmd";
        String payload = "{\"peltier\":" + (on ? "true" : "false") + "}";

        try {
            ensureConnected();

            MqttMessage msg = new MqttMessage(payload.getBytes(StandardCharsets.UTF_8));
            msg.setQos(1);          // at-least-once
            msg.setRetained(false); // dev: no retain

            System.out.println("➡️  Publishing to " + topic + " :: " + payload + " (qos=1, retain=false)");
            pubClient.publish(topic, msg);
            System.out.println("✅ Publish OK to " + topic);

        } catch (Exception e) {
            System.err.println("❌ MQTT publish failed: " + e.getMessage());
        }

        // 2) upsert device_state (still storing "ON"/"OFF" for now; later convert to boolean)
        jdbc.update("""
            INSERT INTO device_state(device_id, peltier, updated_at)
            VALUES (?, ?, NOW(6))
            ON DUPLICATE KEY UPDATE peltier=VALUES(peltier), updated_at=NOW(6)
        """, boxId, on ? "ON" : "OFF");
    }

    private synchronized void ensureConnected() throws Exception {
        if (pubClient != null && pubClient.isConnected()) return;

        String clientId = "astra-actuator-pub-" + UUID.randomUUID();
        pubClient = new MqttClient(brokerUrl, clientId, new MemoryPersistence());

        MqttConnectOptions opts = new MqttConnectOptions();
        opts.setAutomaticReconnect(true);
        opts.setCleanSession(true);

        System.out.println("🔌 Actuator publisher connecting to " + brokerUrl);
        pubClient.connect(opts);
        System.out.println("🔌 Actuator publisher connected");
    }
}
