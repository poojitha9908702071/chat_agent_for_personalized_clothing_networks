-- USER DATA ISOLATION TABLES
-- All tables include user_email for complete data separation

-- 1. Search History Table
CREATE TABLE IF NOT EXISTS user_search_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    search_query TEXT NOT NULL,
    search_filters JSON,
    results_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_email (user_email),
    INDEX idx_created_at (created_at)
);

-- 2. User Wishlist Table
CREATE TABLE IF NOT EXISTS user_wishlist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    product_id VARCHAR(50) NOT NULL,
    product_name VARCHAR(255),
    product_image TEXT,
    product_price DECIMAL(10,2),
    product_category VARCHAR(100),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_product (user_email, product_id),
    INDEX idx_user_email (user_email)
);

-- 3. User Cart Table
CREATE TABLE IF NOT EXISTS user_cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    product_id VARCHAR(50) NOT NULL,
    product_name VARCHAR(255),
    product_image TEXT,
    product_price DECIMAL(10,2),
    product_category VARCHAR(100),
    quantity INT DEFAULT 1,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_product (user_email, product_id),
    INDEX idx_user_email (user_email)
);

-- 4. User Orders Table
CREATE TABLE IF NOT EXISTS user_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    order_id VARCHAR(100) UNIQUE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    order_status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    shipping_address TEXT,
    order_items JSON, -- Store cart items as JSON
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (user_email),
    INDEX idx_order_status (order_status),
    INDEX idx_created_at (created_at)
);

-- 5. User Chat History Table
CREATE TABLE IF NOT EXISTS user_chat_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    session_id VARCHAR(100), -- Optional: group messages by session
    message_text TEXT NOT NULL,
    is_user_message BOOLEAN NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text', -- text, product_search, calendar, etc.
    message_data JSON, -- Store products, filters, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_email (user_email),
    INDEX idx_session_id (session_id),
    INDEX idx_created_at (created_at)
);

-- 6. User Calendar Events Table
CREATE TABLE IF NOT EXISTS user_calendar_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    user_gender ENUM('Men', 'Women') NOT NULL,
    event_date DATE NOT NULL,
    event_name VARCHAR(255) NOT NULL,
    event_category VARCHAR(100), -- festival, personal, work, etc.
    outfit_suggestions JSON, -- Store suggested products
    notes TEXT,
    reminder_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_email (user_email),
    INDEX idx_event_date (event_date),
    INDEX idx_user_gender (user_gender)
);

-- 7. User Cancelled Orders Table (separate for tracking)
CREATE TABLE IF NOT EXISTS user_cancelled_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    original_order_id VARCHAR(100) NOT NULL,
    cancellation_reason TEXT,
    refund_amount DECIMAL(10,2),
    refund_status ENUM('pending', 'processed', 'completed') DEFAULT 'pending',
    cancelled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_email (user_email),
    INDEX idx_original_order_id (original_order_id)
);

-- 8. User Preferences Table (for personalization)
CREATE TABLE IF NOT EXISTS user_preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL UNIQUE,
    preferred_gender ENUM('Men', 'Women'),
    preferred_categories JSON, -- Store favorite categories
    preferred_colors JSON, -- Store favorite colors
    price_range_min DECIMAL(10,2) DEFAULT 0,
    price_range_max DECIMAL(10,2) DEFAULT 10000,
    size_preferences JSON, -- Store preferred sizes
    notification_settings JSON, -- Email, SMS preferences
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (user_email)
);

-- Add indexes for better performance
ALTER TABLE user_search_history ADD INDEX idx_user_query (user_email, created_at);
ALTER TABLE user_wishlist ADD INDEX idx_user_added (user_email, added_at);
ALTER TABLE user_cart ADD INDEX idx_user_updated (user_email, updated_at);
ALTER TABLE user_orders ADD INDEX idx_user_status (user_email, order_status);
ALTER TABLE user_chat_history ADD INDEX idx_user_session (user_email, session_id);
ALTER TABLE user_calendar_events ADD INDEX idx_user_date (user_email, event_date);

-- Sample data for testing (optional)
-- INSERT INTO user_preferences (user_email, preferred_gender) VALUES 
-- ('poojitha@example.com', 'Women'),
-- ('nithya@example.com', 'Women'),
-- ('sunitha@example.com', 'Women');