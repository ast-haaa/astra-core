package com.astra.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name="alert_template")
public class AlertTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String code;

    private String sourceLang = "en";

    @Column(columnDefinition="TEXT")
    private String template;    // English default

    // 🔥 NEW LANGUAGE FIELDS
    @Column(columnDefinition="TEXT")
    private String templateHi;  // Hindi

    @Column(columnDefinition="TEXT")
    private String templateMr;  // Marathi

    @Column(columnDefinition="TEXT")
    private String templateGu;  // Gujarati

    private OffsetDateTime createdAt = OffsetDateTime.now();


    // === getters / setters ===

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getSourceLang() { return sourceLang; }
    public void setSourceLang(String sourceLang) { this.sourceLang = sourceLang; }

    public String getTemplate() { return template; }
    public void setTemplate(String template) { this.template = template; }

    public String getTemplateHi() { return templateHi; }
    public void setTemplateHi(String templateHi) { this.templateHi = templateHi; }

    public String getTemplateMr() { return templateMr; }
    public void setTemplateMr(String templateMr) { this.templateMr = templateMr; }

    public String getTemplateGu() { return templateGu; }
    public void setTemplateGu(String templateGu) { this.templateGu = templateGu; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
