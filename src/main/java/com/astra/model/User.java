package com.astra.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true)
    private String mobile;

    private String email;

    private String city;
    private String state;

    private String village; // NEW for profile screen

   



    @Column(name = "lang_pref")
    private String langPref = "en";

    private String role = "FARMER";

    @Column(name = "farm_name")
    private String farmName;

    @Column(columnDefinition = "JSON")
    private String meta;

    @Column(name = "onboarding_completed")
    private boolean onboardingCompleted = false;

    @Column(name = "created_at")
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    // Getters & Setters

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getMobile() { return mobile; }
    public void setMobile(String mobile) { this.mobile = mobile; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getVillage() { return village; }
    public void setVillage(String village) { this.village = village; }

    public String getLangPref() { return langPref; }
    public void setLangPref(String langPref) { this.langPref = langPref; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getFarmName() { return farmName; }
    public void setFarmName(String farmName) { this.farmName = farmName; }

    public String getMeta() { return meta; }
    public void setMeta(String meta) { this.meta = meta; }

    public boolean isOnboardingCompleted() { return onboardingCompleted; }
    public void setOnboardingCompleted(boolean onboardingCompleted) {
        this.onboardingCompleted = onboardingCompleted;
    }
    
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }

    public boolean isFarmer() {
        return "FARMER".equalsIgnoreCase(this.role);
    }
}
