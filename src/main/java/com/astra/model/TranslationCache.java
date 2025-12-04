package com.astra.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "translation_cache",
       uniqueConstraints = {@UniqueConstraint(columnNames = {"src_hash", "target_lang", "provider"})})
public class TranslationCache {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "src_hash", nullable = false, length = 64)
    private String srcHash;

    @Column(name = "source_text", columnDefinition = "text", nullable = false)
    private String sourceText;

    @Column(name = "target_lang", nullable = false, length = 8)
    private String targetLang;

    @Column(name = "provider", length = 32)
    private String provider;

    @Column(name = "translated_text", columnDefinition = "text", nullable = false)
    private String translatedText;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    // getters & setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSrcHash() { return srcHash; }
    public void setSrcHash(String srcHash) { this.srcHash = srcHash; }

    public String getSourceText() { return sourceText; }
    public void setSourceText(String sourceText) { this.sourceText = sourceText; }

    public String getTargetLang() { return targetLang; }
    public void setTargetLang(String targetLang) { this.targetLang = targetLang; }

    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }

    public String getTranslatedText() { return translatedText; }
    public void setTranslatedText(String translatedText) { this.translatedText = translatedText; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
