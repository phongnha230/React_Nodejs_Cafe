-- Loyalty coins and vouchers.
-- Run this once on an existing database before using the feature.

ALTER TABLE users
  ADD COLUMN coins INT NOT NULL DEFAULT 0;

ALTER TABLE orders
  ADD COLUMN subtotal_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  ADD COLUMN discount_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  ADD COLUMN voucher_id INT NULL,
  ADD COLUMN user_voucher_id INT NULL;

UPDATE orders
SET subtotal_amount = total_amount
WHERE subtotal_amount = 0;

CREATE TABLE coin_transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  review_id INT NULL UNIQUE,
  amount INT NOT NULL,
  type VARCHAR(50) NOT NULL,
  description VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_coin_transactions_user
    FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_coin_transactions_review
    FOREIGN KEY (review_id) REFERENCES reviews(id)
);

CREATE TABLE vouchers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  type ENUM('coin_exchange', 'direct') NOT NULL DEFAULT 'direct',
  discount_type ENUM('percent', 'fixed') NOT NULL,
  discount_value INT NOT NULL,
  coin_cost INT NOT NULL DEFAULT 0,
  min_order_amount INT NOT NULL DEFAULT 0,
  max_discount_amount INT NULL,
  usage_limit INT NULL,
  used_count INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  start_at DATETIME NULL,
  end_at DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE user_vouchers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  voucher_id INT NOT NULL,
  is_used BOOLEAN NOT NULL DEFAULT FALSE,
  used_order_id INT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  used_at DATETIME NULL,
  CONSTRAINT fk_user_vouchers_user
    FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_user_vouchers_voucher
    FOREIGN KEY (voucher_id) REFERENCES vouchers(id),
  CONSTRAINT fk_user_vouchers_order
    FOREIGN KEY (used_order_id) REFERENCES orders(id)
);

ALTER TABLE orders
  ADD CONSTRAINT fk_orders_voucher
    FOREIGN KEY (voucher_id) REFERENCES vouchers(id),
  ADD CONSTRAINT fk_orders_user_voucher
    FOREIGN KEY (user_voucher_id) REFERENCES user_vouchers(id);
