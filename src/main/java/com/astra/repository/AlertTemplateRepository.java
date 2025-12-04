package com.astra.repository;

import com.astra.model.AlertTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AlertTemplateRepository extends JpaRepository<AlertTemplate, Long> {
    Optional<AlertTemplate> findByCode(String code);
}
