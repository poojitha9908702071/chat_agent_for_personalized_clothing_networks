-- ENHANCED USER DATA ISOLATION SYSTEM
-- Complete user-based data separation with return/refund history

-- 1. Search History Table (Enhanced)
CREATE TABLE IF NOT EXISTS user_search_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    search_query TEXT NOT NULL,
    search_filters JSON,
    results_count INT DEFAULT 0,
    search_type ENUM('text', 'voice', 'image', 'filter') DEFAULT 'text',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_email (user_email),
    INDEX idx_created_at (created_at),
    INDEX idx_user_search_type (user_email, search_type)
);

-- 2. User Wishlist Table (Enhanced)
CREATE TABLE IF NOT EXISTS user_wishlist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    product_id VARCHAR(50) NOT NULL,
    product_name VARCHAR(255),
    product_image TEXT,
    product_price DECIMAL(10,2),
    product_category VARCHAR(100),
    product_brand VARCHAR(100),
    product_size VARCHAR(20),
    product_color VARCHAR(50),
    notes TEXT,
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_product (user_email, product_id),
    INDEX idx_user_email (user_email),
    INDEX idx_user_priority (user_email, priority)
);

-- 3. User Cart Table (Enhanced)
CREATE TABLE IF NOT EXISTS user_cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    product_id VARCHAR(50) NOT NULL,
    product_name VARCHAR(255),
    product_image TEXT,
    product_price DECIMAL(10,2),
    product_category VARCHAR(100),
    product_brand VARCHAR(100),
    product_size VARCHAR(20),
    product_color VARCHAR(50),
    quantity INT DEFAULT 1,
    selected_for_checkout BOOLEAN DEFAULT TRUE,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_product (user_email, product_id),
    INDEX idx_user_email (user_email),
    INDEX idx_user_checkout (user_email, selected_for_checkout)
);

-- 4. User Orders Table (Enhanced)
CREATE TABLE IF NOT EXISTS user_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    order_id VARCHAR(100) UNIQUE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    shipping_cost DECIMAL(10,2) DEFAULT 0,
    final_amount DECIMAL(10,2) NOT NULL,
    order_status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    payment_status ENUM('pending', 'paid', 'failed', 'refunded', 'partial_refund') DEFAULT 'pending',
    payment_method VARCHAR(50),
    shipping_address TEXT,
    billing_address TEXT,
    tracking_number VARCHAR(100),
    estimated_delivery DATE,
    actual_delivery DATE,
    order_items JSON, -- Store cart items as JSON
    order_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (user_email),
    INDEX idx_order_status (order_status),
    INDEX idx_payment_status (payment_status),
    INDEX idx_user_status (user_email, order_status),
    INDEX idx_created_at (created_at)
);

-- 5. User Return/Refund History Table (NEW)
CREATE TABLE IF NOT EXISTS user_returns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    return_id VARCHAR(100) UNIQUE NOT NULL,
    original_order_id VARCHAR(100) NOT NULL,
    return_type ENUM('return', 'exchange', 'refund') NOT NULL,
    return_reason ENUM('defective', 'wrong_size', 'wrong_color', 'not_as_described', 'damaged', 'changed_mind', 'other') NOT NULL,
    return_description TEXT,
    returned_items JSON, -- Items being returned
    return_amount DECIMAL(10,2) NOT NULL,
    return_status ENUM('requested', 'approved', 'rejected', 'pickup_scheduled', 'picked_up', 'processing', 'completed', 'cancelled') DEFAULT 'requested',
    refund_status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    refund_amount DECIMAL(10,2) DEFAULT 0,
    refund_method VARCHAR(50),
    pickup_address TEXT,
    pickup_date DATE,
    return_tracking_number VARCHAR(100),
    admin_notes TEXT,
    images JSON, -- Return item images
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (user_email),
    INDEX idx_original_order (original_order_id),
    INDEX idx_return_status (return_status),
    INDEX idx_refund_status (refund_status),
    INDEX idx_user_return_status (user_email, return_status),
    FOREIGN KEY (original_order_id) REFERENCES user_orders(order_id) ON DELETE CASCADE
);

-- 6. User Order Items Table (NEW - Detailed item tracking)
CREATE TABLE IF NOT EXISTS user_order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    order_id VARCHAR(100) NOT NULL,
    product_id VARCHAR(50) NOT NULL,
    product_name VARCHAR(255),
    product_image TEXT,
    product_price DECIMAL(10,2),
    product_category VARCHAR(100),
    product_brand VARCHAR(100),
    product_size VARCHAR(20),
    product_color VARCHAR(50),
    quantity INT NOT NULL,
    item_total DECIMAL(10,2) NOT NULL,
    item_status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'returned', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_email (user_email),
    INDEX idx_order_id (order_id),
    INDEX idx_product_id (product_id),
    INDEX idx_user_order (user_email, order_id),
    FOREIGN KEY (order_id) REFERENCES user_orders(order_id) ON DELETE CASCADE
);

-- 7. User Chat History Table (Enhanced)
CREATE TABLE IF NOT EXISTS user_chat_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    session_id VARCHAR(100),
    message_text TEXT NOT NULL,
    is_user_message BOOLEAN NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text',
    message_data JSON,
    response_time_ms INT DEFAULT 0,
    user_rating TINYINT DEFAULT NULL, -- 1-5 rating for AI responses
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_email (user_email),
    INDEX idx_session_id (session_id),
    INDEX idx_user_session (user_email, session_id),
    INDEX idx_created_at (created_at)
);

-- 8. User Calendar Events Table (Enhanced)
CREATE TABLE IF NOT EXISTS user_calendar_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    user_gender ENUM('Men', 'Women') NOT NULL,
    event_date DATE NOT NULL,
    event_name VARCHAR(255) NOT NULL,
    event_category VARCHAR(100),
    event_type ENUM('festival', 'personal', 'work', 'social', 'custom') DEFAULT 'personal',
    outfit_suggestions JSON,
    recommended_products JSON,
    notes TEXT,
    reminder_sent BOOLEAN DEFAULT FALSE,
    reminder_date DATE,
    event_importance ENUM('low', 'medium', 'high') DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (user_email),
    INDEX idx_event_date (event_date),
    INDEX idx_user_gender (user_gender),
    INDEX idx_user_date (user_email, event_date),
    INDEX idx_reminder_date (reminder_date)
);

-- 9. User Preferences Table (Enhanced)
CREATE TABLE IF NOT EXISTS user_preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL UNIQUE,
    preferred_gender ENUM('Men', 'Women'),
    preferred_categories JSON,
    preferred_colors JSON,
    preferred_brands JSON,
    preferred_sizes JSON,
    price_range_min DECIMAL(10,2) DEFAULT 0,
    price_range_max DECIMAL(10,2) DEFAULT 10000,
    notification_settings JSON,
    privacy_settings JSON,
    language_preference VARCHAR(10) DEFAULT 'en',
    currency_preference VARCHAR(10) DEFAULT 'INR',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (user_email)
);

-- 10. User Sessions Table (NEW - Track login sessions)
CREATE TABLE IF NOT EXISTS user_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    session_token VARCHAR(500) NOT NULL,
    device_info JSON,
    ip_address VARCHAR(45),
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    logout_time TIMESTAMP NULL,
    session_status ENUM('active', 'expired', 'logged_out') DEFAULT 'active',
    INDEX idx_user_email (user_email),
    INDEX idx_session_token (session_token),
    INDEX idx_session_status (session_status)
);

-- 11. User Activity Log Table (NEW - Audit trail)
CREATE TABLE IF NOT EXISTS user_activity_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    activity_type VARCHAR(100) NOT NULL,
    activity_description TEXT,
    activity_data JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_email (user_email),
    INDEX idx_activity_type (activity_type),
    INDEX idx_created_at (created_at)
);

-- 12. User Notifications Table (NEW)
CREATE TABLE IF NOT EXISTS user_notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    notification_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_data JSON,
    is_read BOOLEAN DEFAULT FALSE,
    is_important BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    INDEX idx_user_email (user_email),
    INDEX idx_notification_type (notification_type),
    INDEX idx_is_read (is_read),
    INDEX idx_user_unread (user_email, is_read)
);

-- Add performance indexes
ALTER TABLE user_search_history ADD INDEX idx_user_query_time (user_email, created_at DESC);
ALTER TABLE user_wishlist ADD INDEX idx_user_added_time (user_email, added_at DESC);
ALTER TABLE user_cart ADD INDEX idx_user_updated_time (user_email, updated_at DESC);
ALTER TABLE user_orders ADD INDEX idx_user_order_time (user_email, created_at DESC);
ALTER TABLE user_returns ADD INDEX idx_user_return_time (user_email, created_at DESC);
ALTER TABLE user_chat_history ADD INDEX idx_user_chat_time (user_email, created_at DESC);
ALTER TABLE user_calendar_events ADD INDEX idx_user_event_time (user_email, event_date ASC);

-- Create views for easy data access
CREATE OR REPLACE VIEW user_order_summary AS
SELECT 
    user_email,
    COUNT(*) as total_orders,
    SUM(final_amount) as total_spent,
    COUNT(CASE WHEN order_status = 'delivered' THEN 1 END) as delivered_orders,
    COUNT(CASE WHEN order_status = 'cancelled' THEN 1 END) as cancelled_orders,
    AVG(final_amount) as avg_order_value,
    MAX(created_at) as last_order_date
FROM user_orders 
GROUP BY user_email;

CREATE OR REPLACE VIEW user_return_summary AS
SELECT 
    user_email,
    COUNT(*) as total_returns,
    SUM(return_amount) as total_return_amount,
    COUNT(CASE WHEN return_status = 'completed' THEN 1 END) as completed_returns,
    COUNT(CASE WHEN refund_status = 'completed' THEN 1 END) as completed_refunds,
    AVG(return_amount) as avg_return_amount
FROM user_returns 
GROUP BY user_email;