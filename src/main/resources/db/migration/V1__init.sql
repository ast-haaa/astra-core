CREATE TABLE batch (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  batch_code VARCHAR(100) UNIQUE NOT NULL,
  herb_name VARCHAR(200),
  farmer_name VARCHAR(200),
  origin_location VARCHAR(255),
  status VARCHAR(50),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE alert (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  batch_code VARCHAR(100) NOT NULL,
  message TEXT,
  parameter VARCHAR(100),
  current_value DECIMAL(10,2),
  threshold_low DECIMAL(10,2),
  threshold_high DECIMAL(10,2),
  status VARCHAR(50),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE alert_action (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  batch_code VARCHAR(100) NOT NULL,
  action_type VARCHAR(50),
  description TEXT,
  performed_by VARCHAR(100),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lab_test (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  batch_code VARCHAR(100) NOT NULL,
  result VARCHAR(20),
  remarks TEXT,
  performed_by VARCHAR(100),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
