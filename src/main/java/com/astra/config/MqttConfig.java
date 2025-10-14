package com.astra.config;

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

@Configuration
public class MqttConfig {

    private static final Logger log = LoggerFactory.getLogger(MqttConfig.class);

    @Value("${mqtt.broker.url:tcp://mosquitto:1883}")
    private String brokerUrl;

    @Value("${mqtt.client.id:astra-backend-client}")
    private String clientId;

    @Value("${mqtt.topic:boxes/+/telemetry}")
    private String topicFilter;

    // scheduler for reconnect attempts
    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();

    // small counter used for exponential backoff (capped)
    private final AtomicInteger backoffSeconds = new AtomicInteger(0);

    private MqttClient client;
    private MqttConnectOptions options;

    // The service that processes & saves telemetry
    private final com.astra.service.MqttListenerService mqttListenerService;

    // Constructor injection for the listener service
    @Autowired
    public MqttConfig(com.astra.service.MqttListenerService mqttListenerService) {
        this.mqttListenerService = mqttListenerService;
    }

    @Bean
    public MqttConnectOptions mqttConnectOptions() {
        MqttConnectOptions opts = new MqttConnectOptions();
        opts.setAutomaticReconnect(true); // Paho's auto-reconnect
        opts.setCleanSession(true);
        // opts.setUserName("user"); opts.setPassword("pass".toCharArray());
        this.options = opts;
        return opts;
    }

    @Bean
    public MqttClient mqttClient(MqttConnectOptions options) throws MqttException {
        MemoryPersistence persistence = new MemoryPersistence();
        client = new MqttClient(brokerUrl, clientId, persistence);
        client.setCallback(new ReconnectingMqttCallback());
        // do NOT block startup forever; attemptConnect handles connecting asynchronously
        // but try an immediate connect attempt synchronously for quick success:
        attemptConnect(0);
        return client;
    }

    /**
     * Try to connect now or schedule after delaySeconds.
     */
    private synchronized void attemptConnect(int delaySeconds) {
        // schedule the connect task after delaySeconds
        scheduler.schedule(() -> {
            try {
                if (client == null) {
                    log.warn("MQTT client object is null; cannot connect yet.");
                    return;
                }
                if (client.isConnected()) {
                    log.debug("MQTT client already connected.");
                    // reset backoff on successful connect
                    backoffSeconds.set(0);
                    return;
                }
                log.info("Attempting MQTT connect to {} (delay {})", brokerUrl, delaySeconds);
                client.connect(options);
                log.info("Connected to MQTT broker: {}", brokerUrl);

                // subscribe after successful connect
                client.subscribe(topicFilter);
                log.info("Subscribed to topic filter: {}", topicFilter);

                // reset backoff on success
                backoffSeconds.set(0);
            } catch (MqttException e) {
                // schedule next retry with exponential backoff
                int current = backoffSeconds.updateAndGet(v -> v == 0 ? 2 : Math.min(v * 2, 120));
                log.warn("MQTT connect failed: {} — scheduling retry in {}s", e.getMessage(), current);
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

    /**
     * Callback that triggers reconnect scheduling on connection loss.
     * Messages are handed off to MqttListenerService.processMessage(...)
     */
    class ReconnectingMqttCallback implements MqttCallback {
        @Override
        public void connectionLost(Throwable cause) {
            log.warn("MQTT connection lost: {}", cause == null ? "unknown" : cause.getMessage());
            // schedule reconnect attempt using current backoff (non-zero -> use that, else start with 2s)
            int next = backoffSeconds.get() == 0 ? 2 : backoffSeconds.get();
            attemptConnect(next);
        }

        @Override
        public void messageArrived(String topic, MqttMessage message) throws Exception {
            // hand raw bytes to centralized processor in MqttListenerService
            mqttListenerService.processMessage(topic, message.getPayload());
        }

        @Override
        public void deliveryComplete(IMqttDeliveryToken token) {
            // not used for subscribers
        }
    }
}
