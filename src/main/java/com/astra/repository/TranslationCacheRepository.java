package com.astra.repository;

import com.astra.model.TranslationCache;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TranslationCacheRepository extends JpaRepository<TranslationCache, Long> {
    Optional<TranslationCache> findBySrcHashAndTargetLangAndProvider(String srcHash, String targetLang, String provider);
}
