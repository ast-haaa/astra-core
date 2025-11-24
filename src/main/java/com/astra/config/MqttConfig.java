package com.astra.config;

import com.astra.service.AckService;
import java.util.concurrent.ScheduledExecutorService;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import jakarta.annotation.PreDestroy;

import org.eclipse.paho.client.mqttv3.IMqttDeliveryToken;
import org.eclipse.paho.client.mqttv3.MqttCallback;
import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.eclipse.paho.client.mqttv3.persist.MemoryPersistence;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.UUID;  // <-- IMPORTANT FIX: add UUID

@Configuration
public class MqttConfig {

    private final com.astra.service.MqttListenerService mqttListenerService;
    private final AckService ackService;

    private static final Logger log = LoggerFactory.getLogger(MqttConfig.class);

    @Value("${mqtt.broker:tcp://localhost:1883}")
    private String brokerUrl;

    // IMPORTANT FIX:
    // If mqtt.clientId is blank → auto generate unique ID
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

    public MqttConfig(com.astra.service.MqttListenerService mqttListenerService,
                      AckService ackService) {
        this.mqttListenerService = mqttListenerService;
        this.ackService = ackService;
    }

    @Bean
    public MqttConnectOptions mqttConnectOptions() {
        MqttConnectOptions opts = new MqttConnectOptions();
        opts.setAutomaticReconnect(true);
        opts.setCleanSession(true);
        this.options = opts;
        return opts;
    }

    @Bean
    public MqttClient mqttClient(MqttConnectOptions options) throws MqttException {

        // FINAL FIX: generate unique client ID **only if empty**
        String clientId = (configuredClientId == null || configuredClientId.isBlank() || "astra-backend-client".equals(configuredClientId))
                ? "astra-backend-" + UUID.randomUUID().toString().substring(0, 8)
                : configuredClientId;

        log.warn("MQTT Using clientId={}", clientId);

        client = new MqttClient(brokerUrl, clientId, new MemoryPersistence());
        client.setCallback(new ReconnectingMqttCallback());

        attemptConnect(0);
        return client;
    }

    private synchronized void attemptConnect(int delaySeconds) {
        scheduler.schedule(() -> {
            try {
                if (client == null) {
                    log.warn("MQTT client object is null; cannot connect yet.");
                    return;
                }
                if (client.isConnected()) {
                    log.debug("MQTT client already connected.");
                    backoffSeconds.set(0);
                    return;
                }

                log.info("Attempting MQTT connect to {} (delay {})", brokerUrl, delaySeconds);
                client.connect(options);
                log.info("Connected to MQTT broker: {}", brokerUrl);

                client.subscribe(topicFilter);
                log.info("Subscribed to topic filter: {}", topicFilter);

                client.subscribe(ackTopic);
                log.info("Subscribed to ACK topic: {}", ackTopic);

                backoffSeconds.set(0);

            } catch (MqttException e) {
                int current = backoffSeconds.updateAndGet(v -> v == 0 ? 2 : Math.min(v * 2, 120));
                log.warn("MQTT connect failed: {} — retry in {}s", e.getMessage(), current);
                attemptConnect(current);
            }
        }, delaySeconds, TimeUnit.SECONDS);
    }

    @PreDestroy
    public void shutdown() {
        try {
            scheduler.shutdownNow();
        } catch (Exception ex) {
            log.warn("Error shutting down scheduler", ex);
        }
        if (client != null && client.isConnected()) {
            try {
                client.disconnect();
                client.close();
                log.info("Disconnected MQTT client");
            } catch (MqttException e) {
                log.warn("Error while disconnecting MQTT client", e);
            }
        }
    }

    class ReconnectingMqttCallback implements MqttCallback {

        @Override
        public void connectionLost(Throwable cause) {
            log.warn("MQTT connection lost: {}", cause == null ? "unknown" : cause.getMessage());
            int next = backoffSeconds.get() == 0 ? 2 : backoffSeconds.get();
            attemptConnect(next);
        }

        @Override
        public void messageArrived(String topic, MqttMessage message) throws Exception {
            String payload = new String(message.getPayload(), StandardCharsets.UTF_8);
            log.info("MQTT IN topic={} len={}", topic, message.getPayload().length);

            if (topic.startsWith("boxes/") && topic.endsWith("/ack")) {
                log.info("Routing to AckService: {}", topic);
                ackService.handleAck(topic, payload);
                return;
            }

            mqttListenerService.processMessage(topic, message.getPayload());
        }

        @Override
        public void deliveryComplete(IMqttDeliveryToken token) {
        }
    }
}

