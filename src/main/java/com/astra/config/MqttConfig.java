package com.astra.config;

import com.astra.service.AckService;
import com.astra.service.MqttListenerService;
import jakarta.annotation.PreDestroy;
import org.eclipse.paho.client.mqttv3.*;
import org.eclipse.paho.client.mqttv3.persist.MemoryPersistence;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.nio.charset.StandardCharsets;
import java.util.UUID;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

@Configuration
public class MqttConfig {

    private static final Logger log = LoggerFactory.getLogger(MqttConfig.class);

    private final MqttListenerService mqttListenerService;
    private final AckService ackService;

    @Value("${mqtt.broker:tcp://localhost:1883}")
    private String brokerUrl;

    @Value("${mqtt.clientId:}")
    private String configuredClientId;

    @Value("${mqtt.topic:boxes/+/telemetry}")
    private String topicFilter;

    @Value("${mqtt.ackTopic:boxes/+/ack}")
    private String ackTopic;

    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();
    private final AtomicInteger backoffSeconds = new AtomicInteger(0);

    private MqttClient client;
    private MqttConnectOptions options;

    public MqttConfig(
            MqttListenerService mqttListenerService,
            AckService ackService
    ) {
        this.mqttListenerService = mqttListenerService;
        this.ackService = ackService;
    }

    // ---------------------------------------------------------------
    @Bean
    public MqttConnectOptions mqttConnectOptions() {
        MqttConnectOptions opts = new MqttConnectOptions();
        opts.setAutomaticReconnect(true);
        opts.setCleanSession(true);
        this.options = opts;
        return opts;
    }

    // ---------------------------------------------------------------
    @Bean
    public MqttClient mqttClient(MqttConnectOptions options) throws MqttException {

        String clientId =
                (configuredClientId == null || configuredClientId.isBlank()
                        || "astra-backend-client".equals(configuredClientId))
                        ? "astra-backend-" + UUID.randomUUID().toString().substring(0, 8)
                        : configuredClientId;

        log.warn("MQTT Using clientId={}", clientId);

        client = new MqttClient(brokerUrl, clientId, new MemoryPersistence());
        client.setCallback(new ReconnectingMqttCallback());

        attemptConnect(0);
        return client;
    }

    // ---------------------------------------------------------------
    private synchronized void attemptConnect(int delaySeconds) {
        scheduler.schedule(() -> {
            try {
                if (client == null) {
                    log.warn("MQTT client is null; cannot connect.");
                    return;
                }
                if (client.isConnected()) {
                    backoffSeconds.set(0);
                    return;
                }

                log.info("Attempting MQTT connect → {}", brokerUrl);
                client.connect(options);

                log.info("✔ Connected to MQTT");

                client.subscribe(topicFilter);
                log.info("Subscribed → {}", topicFilter);

                client.subscribe(ackTopic);
                log.info("Subscribed ACK → {}", ackTopic);

                backoffSeconds.set(0);

            } catch (MqttException e) {
                int next = backoffSeconds.updateAndGet(v -> v == 0 ? 2 : Math.min(v * 2, 120));
                log.warn("MQTT connect failed → retry in {}s", next);
                attemptConnect(next);
            }
        }, delaySeconds, TimeUnit.SECONDS);
    }

    // ---------------------------------------------------------------
    @PreDestroy
    public void shutdown() {
        try {
            scheduler.shutdownNow();
        } catch (Exception ignored) {}

        if (client != null && client.isConnected()) {
            try {
                client.disconnect();
                client.close();
            } catch (Exception ignored) {}
        }
    }

    // ---------------------------------------------------------------
    class ReconnectingMqttCallback implements MqttCallback {

        @Override
        public void connectionLost(Throwable cause) {
            log.warn("MQTT lost → {}", cause != null ? cause.getMessage() : "unknown");
            int next = Math.max(2, backoffSeconds.get());
            attemptConnect(next);
        }

        @Override
        public void messageArrived(String topic, MqttMessage msg) {

            try {
                log.info("IN MQTT: topic={} bytes={}", topic, msg.getPayload().length);

                String payload = new String(msg.getPayload(), StandardCharsets.UTF_8);

                // ACK HANDLING
                if (topic.startsWith("boxes/") && topic.endsWith("/ack")) {
                    ackService.handleAck(topic, payload);
                    return;
                }

                // TELEMETRY HANDLING
                mqttListenerService.processMessage(topic, msg.getPayload());

            } catch (Exception e) {
                log.error("MQTT messageArrived ERROR → {}", e.getMessage());
            }
        }

        @Override
        public void deliveryComplete(IMqttDeliveryToken token) {}
    }
}
