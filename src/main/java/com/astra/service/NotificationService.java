package com.astra.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.astra.model.Alert;
import com.astra.model.User;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final AlertService alertService;
    private final TranslationService translationService;
    private final CallProviderClient callProviderClient;

    public String sendAlert(String templateCode, Map<String, String> params) {
        String message = alertService.buildMessage(templateCode, params);
        System.out.println("Sending alert: " + message);
        return message;
    }

    public void sendAlertNotification(Alert alert, User farmer) {

        String lang = (farmer.getLangPref() != null)
                ? farmer.getLangPref()
                : "en";

        String msg = translationService.renderAlertText(alert, lang);

        if (farmer.getMobile() != null && !farmer.getMobile().isEmpty()) {
            callProviderClient.makeCall(farmer.getMobile(), msg);
        }

        System.out.println("Call Notification Sent ➜ " + farmer.getMobile());
    }
}
