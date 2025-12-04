package com.astra.service;

import com.astra.model.Alert;
import com.astra.model.AlertTemplate;
import com.astra.model.TranslationCache;
import com.astra.repository.AlertTemplateRepository;
import com.astra.repository.TranslationCacheRepository;
import com.astra.util.JsonUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TranslationService {

    private final TranslationCacheRepository cacheRepo;
    private final AlertTemplateRepository templateRepo;

    // ----------------------------------------------------------------------
    // OLD FALLBACK TRANSLATION (kept for safety)
    // ----------------------------------------------------------------------
    public String translateTemplate(String text, String targetLang) {
        if (text == null || targetLang == null || targetLang.equalsIgnoreCase("en")) {
            return text;
        }

        String hash = sha256(text);

        Optional<TranslationCache> cached =
                cacheRepo.findBySrcHashAndTargetLangAndProvider(hash, targetLang, "DUMMY");

        if (cached.isPresent()) {
            return cached.get().getTranslatedText();
        }

        // DUMMY (replace with real API later)
        String translated = "[" + targetLang.toUpperCase() + "] " + text;

        TranslationCache cache = new TranslationCache();
        cache.setSrcHash(hash);
        cache.setSourceText(text);
        cache.setTargetLang(targetLang);
        cache.setProvider("DUMMY");
        cache.setTranslatedText(translated);
        cache.setCreatedAt(OffsetDateTime.now());
        cacheRepo.save(cache);

        return translated;
    }

    // ----------------------------------------------------------------------
    // LANGUAGE TEMPLATE PICKER
    // ----------------------------------------------------------------------
    public String getTemplateForLang(AlertTemplate tpl, String lang) {
        if (lang == null) {
            return tpl.getTemplate();
        }

        switch (lang.toLowerCase()) {
            case "hi":
                return tpl.getTemplateHi() != null ? tpl.getTemplateHi() : tpl.getTemplate();
            case "mr":
                return tpl.getTemplateMr() != null ? tpl.getTemplateMr() : tpl.getTemplate();
            case "gu":
                return tpl.getTemplateGu() != null ? tpl.getTemplateGu() : tpl.getTemplate();
            default:
                return tpl.getTemplate();
        }
    }

    private String sha256(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hashed = md.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hashed) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("SHA-256 failed", e);
        }
    }

    // ----------------------------------------------------------------------
    // FINAL MULTILINGUAL ALERT BUILDER
    // ----------------------------------------------------------------------
    public String renderAlertText(Alert alert, String lang) {

        // Old alerts with no templateCode
        String code = alert.getTemplateCode();
        if (code == null || code.isBlank()) {
            String template = alert.getMessage() != null ? alert.getMessage() : "";
            Map<String, Object> params = JsonUtils.fromJson(alert.getParams());

            if (params != null) {
                for (Map.Entry<String, Object> e : params.entrySet()) {
                    template = template.replace("{" + e.getKey() + "}", String.valueOf(e.getValue()));
                }
            }
            return template;
        }

        // Normal path
        AlertTemplate tpl = templateRepo.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Template not found: " + code));

        String template = getTemplateForLang(tpl, lang);

        Map<String, Object> params = JsonUtils.fromJson(alert.getParams());
        if (params != null) {
            for (Map.Entry<String, Object> e : params.entrySet()) {
                template = template.replace("{" + e.getKey() + "}", String.valueOf(e.getValue()));
            }
        }

        return template;
    }
}
