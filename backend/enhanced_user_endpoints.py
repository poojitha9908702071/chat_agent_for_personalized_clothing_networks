# Enhanced User Data Isolation Endpoints
# Complete user-based data separation with return/refund system

from flask import request, jsonify
import json
from datetime import datetime, timedelta
from db import execute_query

def get_user_email_from_token(request):
    """Extract user email from JWT token - SECURE"""
    from app import verify_token
    
    token = request.headers.get('Authorization')
    if token and token.startswith('Bearer '):
        payload = verify_token(token[7:])
        return payload.get('email') if payload else None
    return None

# ============= ENHANCED SEARCH HISTORY =============
def enhanced_search_history():
    """Enhanced search history with search types"""
    user_email = get_user_email_from_token(request)
    if not user_email:
        return jsonify({'error': 'Authentication required'}), 401
    
    if request.method == 'GET':
        try:
            limit = request.args.get('limit', 50, type=int)
            
            searches = execute_query(
                """SELECT id, search_query, search_filters, results_count, 
                          search_type, created_at 
                   FROM user_search_history 
                   WHERE user_email = %s 
                   ORDER BY created_at DESC LIMIT %s""",
                (user_email, limit),
                fetch=True
            )
            
            return jsonify({
                'success': True,
                'searches': searches or [],
                'count': len(searches) if searches else 0,
                'user_email': user_email
            }), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    elif request.method == 'POST':
        try:
            data = request.json
            query = data.get('query')
            filters = data.get('filters', {})
            results_count = data.get('results_count', 0)
            search_type = data.get('search_type', 'text')
            
            execute_query(
                """INSERT INTO user_search_history 
                   (user_email, search_query, search_filters, results_count, search_type) 
                   VALUES (%s, %s, %s, %s, %s)""",
                (user_email, query, json.dumps(filters), results_count, search_type)
            )
            
            return jsonify({'success': True, 'message': 'Search saved'}), 201
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    elif request.method == 'DELETE':
        try:
            # Clear all search history for user
            execute_query(
                "DELETE FROM user_search_history WHERE user_email = %s",
                (user_email,)
            )
            
            return jsonify({'success': True, 'message': 'Search history cleared'}), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500

# ============= ENHANCED WISHLIST =============
def enhanced_wishlist():
    """Enhanced wishlist with priority and notes"""
    user_email = get_user_email_from_token(request)
    if not user_email:
        return jsonify({'error': 'Authentication required'}), 401
    
    if request.method == 'GET':
        try:
            wishlist = execute_query(
                """SELECT id, product_id, product_name, product_image, product_price, 
                          product_category, product_brand, product_size, product_color,
                          notes, priority, added_at 
                   FROM user_wishlist 
                   WHERE user_email = %s 
                   ORDER BY priority DESC, added_at DESC""",
                (user_email,),
                fetch=True
            )
            
            return jsonify({
                'success': True,
                'wishlist': wishlist or [],
                'count': len(wishlist) if wishlist else 0,
                'user_email': user_email
            }), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    elif request.method == 'POST':
        try:
            data = request.json
            
            execute_query(
                """INSERT INTO user_wishlist 
                   (user_email, product_id, product_name, product_image, product_price, 
                    product_category, product_brand, product_size, product_color, notes, priority) 
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                   ON DUPLICATE KEY UPDATE
                   notes = VALUES(notes), priority = VALUES(priority)""",
                (user_email, data.get('product_id'), data.get('product_name'),
                 data.get('product_image'), data.get('product_price'),
                 data.get('product_category'), data.get('product_brand', ''),
                 data.get('product_size', ''), data.get('product_color', ''),
                 data.get('notes', ''), data.get('priority', 'medium'))
            )
            
            return jsonify({'success': True, 'message': 'Item added to wishlist'}), 201
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    elif request.method == 'PUT':
        try:
            data = request.json
            product_id = data.get('product_id')
            
            execute_query(
                """UPDATE user_wishlist 
                   SET notes = %s, priority = %s 
                   WHERE user_email = %s AND product_id = %s""",
                (data.get('notes', ''), data.get('priority', 'medium'), user_email, product_id)
            )
            
            return jsonify({'success': True, 'message': 'Wishlist item updated'}), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    elif request.method == 'DELETE':
        try:
            product_id = request.args.get('product_id')
            
            if product_id:
                # Delete specific item
                execute_query(
                    "DELETE FROM user_wishlist WHERE user_email = %s AND product_id = %s",
                    (user_email, product_id)
                )
            else:
                # Clear entire wishlist
                execute_query(
                    "DELETE FROM user_wishlist WHERE user_email = %s",
                    (user_email,)
                )
            
            return jsonify({'success': True, 'message': 'Wishlist updated'}), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500

# ============= ENHANCED CART =============
def enhanced_cart():
    """Enhanced cart with selection and detailed info"""
    user_email = get_user_email_from_token(request)
    if not user_email:
        return jsonify({'error': 'Authentication required'}), 401
    
    if request.method == 'GET':
        try:
            cart_items = execute_query(
                """SELECT id, product_id, product_name, product_image, product_price, 
                          product_category, product_brand, product_size, product_color,
                          quantity, selected_for_checkout, added_at, updated_at 
                   FROM user_cart 
                   WHERE user_email = %s 
                   ORDER BY updated_at DESC""",
                (user_email,),
                fetch=True
            )
            
            total = 0
            selected_total = 0
            count = 0
            
            if cart_items:
                for item in cart_items:
                    item_total = float(item['product_price']) * item['quantity']
                    total += item_total
                    count += item['quantity']
                    
                    if item['selected_for_checkout']:
                        selected_total += item_total
            
            return jsonify({
                'success': True,
                'cart': cart_items or [],
                'total': total,
                'selectedTotal': selected_total,
                'count': count,
                'user_email': user_email
            }), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    elif request.method == 'POST':
        try:
            data = request.json
            
            execute_query(
                """INSERT INTO user_cart 
                   (user_email, product_id, product_name, product_image, product_price, 
                    product_category, product_brand, product_size, product_color, quantity) 
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                   ON DUPLICATE KEY UPDATE
                   quantity = quantity + VALUES(quantity), updated_at = CURRENT_TIMESTAMP""",
                (user_email, data.get('product_id'), data.get('product_name'),
                 data.get('product_image'), data.get('product_price'),
                 data.get('product_category'), data.get('product_brand', ''),
                 data.get('product_size', ''), data.get('product_color', ''),
                 data.get('quantity', 1))
            )
            
            return jsonify({'success': True, 'message': 'Item added to cart'}), 201
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    elif request.method == 'PUT':
        try:
            data = request.json
            product_id = data.get('product_id')
            
            update_fields = []
            update_values = []
            
            if 'quantity' in data:
                update_fields.append('quantity = %s')
                update_values.append(data['quantity'])
            
            if 'selected_for_checkout' in data:
                update_fields.append('selected_for_checkout = %s')
                update_values.append(data['selected_for_checkout'])
            
            if 'product_size' in data:
                update_fields.append('product_size = %s')
                update_values.append(data['product_size'])
            
            if 'product_color' in data:
                update_fields.append('product_color = %s')
                update_values.append(data['product_color'])
            
            if update_fields:
                update_values.extend([user_email, product_id])
                execute_query(
                    f"""UPDATE user_cart 
                        SET {', '.join(update_fields)}, updated_at = CURRENT_TIMESTAMP 
                        WHERE user_email = %s AND product_id = %s""",
                    tuple(update_values)
                )
            
            return jsonify({'success': True, 'message': 'Cart item updated'}), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    elif request.method == 'DELETE':
        try:
            product_id = request.args.get('product_id')
            
            if product_id:
                # Delete specific item
                execute_query(
                    "DELETE FROM user_cart WHERE user_email = %s AND product_id = %s",
                    (user_email, product_id)
                )
            else:
                # Clear entire cart
                execute_query(
                    "DELETE FROM user_cart WHERE user_email = %s",
                    (user_email,)
                )
            
            return jsonify({'success': True, 'message': 'Cart updated'}), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500

# ============= ENHANCED ORDERS =============
def enhanced_orders():
    """Enhanced orders with detailed tracking"""
    user_email = get_user_email_from_token(request)
    if not user_email:
        return jsonify({'error': 'Authentication required'}), 401
    
    if request.method == 'GET':
        try:
            status_filter = request.args.get('status')
            
            query = """SELECT id, order_id, total_amount, discount_amount, tax_amount, 
                              shipping_cost, final_amount, order_status, payment_status,
                              payment_method, shipping_address, billing_address,
                              tracking_number, estimated_delivery, actual_delivery,
                              order_items, order_notes, created_at, updated_at 
                       FROM user_orders 
                       WHERE user_email = %s"""
            params = [user_email]
            
            if status_filter:
                query += " AND order_status = %s"
                params.append(status_filter)
            
            query += " ORDER BY created_at DESC"
            
            orders = execute_query(query, tuple(params), fetch=True)
            
            return jsonify({
                'success': True,
                'orders': orders or [],
                'count': len(orders) if orders else 0,
                'user_email': user_email
            }), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    elif request.method == 'POST':
        try:
            data = request.json
            order_id = f"ORD_{int(datetime.now().timestamp())}_{user_email.split('@')[0]}"
            
            # Calculate final amount
            total_amount = data.get('total_amount', 0)
            discount_amount = data.get('discount_amount', 0)
            tax_amount = data.get('tax_amount', 0)
            shipping_cost = data.get('shipping_cost', 0)
            final_amount = total_amount - discount_amount + tax_amount + shipping_cost
            
            execute_query(
                """INSERT INTO user_orders 
                   (user_email, order_id, total_amount, discount_amount, tax_amount,
                    shipping_cost, final_amount, payment_method, shipping_address,
                    billing_address, order_items, order_notes) 
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
                (user_email, order_id, total_amount, discount_amount, tax_amount,
                 shipping_cost, final_amount, data.get('payment_method'),
                 data.get('shipping_address'), data.get('billing_address', ''),
                 json.dumps(data.get('order_items', [])), data.get('order_notes', ''))
            )
            
            # Insert order items
            for item in data.get('order_items', []):
                execute_query(
                    """INSERT INTO user_order_items 
                       (user_email, order_id, product_id, product_name, product_image,
                        product_price, product_category, product_brand, product_size,
                        product_color, quantity, item_total) 
                       VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
                    (user_email, order_id, item.get('product_id'), item.get('product_name'),
                     item.get('product_image'), item.get('product_price'),
                     item.get('product_category'), item.get('product_brand', ''),
                     item.get('product_size', ''), item.get('product_color', ''),
                     item.get('quantity', 1), item.get('product_price', 0) * item.get('quantity', 1))
                )
            
            return jsonify({
                'success': True, 
                'message': 'Order placed successfully',
                'order_id': order_id
            }), 201
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500

def get_order_details(order_id):
    """Get specific order details"""
    user_email = get_user_email_from_token(request)
    if not user_email:
        return jsonify({'error': 'Authentication required'}), 401
    
    try:
        order = execute_query(
            """SELECT * FROM user_orders 
               WHERE user_email = %s AND order_id = %s""",
            (user_email, order_id),
            fetch=True
        )
        
        if not order:
            return jsonify({'error': 'Order not found'}), 404
        
        return jsonify({
            'success': True,
            'order': order[0],
            'user_email': user_email
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def get_order_items(order_id):
    """Get order items"""
    user_email = get_user_email_from_token(request)
    if not user_email:
        return jsonify({'error': 'Authentication required'}), 401
    
    try:
        items = execute_query(
            """SELECT * FROM user_order_items 
               WHERE user_email = %s AND order_id = %s 
               ORDER BY created_at""",
            (user_email, order_id),
            fetch=True
        )
        
        return jsonify({
            'success': True,
            'items': items or [],
            'count': len(items) if items else 0,
            'user_email': user_email
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def cancel_order(order_id):
    """Cancel order"""
    user_email = get_user_email_from_token(request)
    if not user_email:
        return jsonify({'error': 'Authentication required'}), 401
    
    try:
        data = request.json
        reason = data.get('reason', 'User requested cancellation')
        
        # Update order status
        execute_query(
            """UPDATE user_orders 
               SET order_status = 'cancelled', order_notes = %s, updated_at = CURRENT_TIMESTAMP 
               WHERE user_email = %s AND order_id = %s""",
            (f"Cancelled: {reason}", user_email, order_id)
        )
        
        # Update order items status
        execute_query(
            """UPDATE user_order_items 
               SET item_status = 'cancelled' 
               WHERE user_email = %s AND order_id = %s""",
            (user_email, order_id)
        )
        
        return jsonify({'success': True, 'message': 'Order cancelled successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============= RETURNS & REFUNDS =============
def user_returns():
    """Handle return/refund requests"""
    user_email = get_user_email_from_token(request)
    if not user_email:
        return jsonify({'error': 'Authentication required'}), 401
    
    if request.method == 'GET':
        try:
            status_filter = request.args.get('status')
            
            query = """SELECT id, return_id, original_order_id, return_type, return_reason,
                              return_description, returned_items, return_amount, return_status,
                              refund_status, refund_amount, refund_method, pickup_address,
                              pickup_date, return_tracking_number, admin_notes, images,
                              created_at, updated_at 
                       FROM user_returns 
                       WHERE user_email = %s"""
            params = [user_email]
            
            if status_filter:
                query += " AND return_status = %s"
                params.append(status_filter)
            
            query += " ORDER BY created_at DESC"
            
            returns = execute_query(query, tuple(params), fetch=True)
            
            return jsonify({
                'success': True,
                'returns': returns or [],
                'count': len(returns) if returns else 0,
                'user_email': user_email
            }), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    elif request.method == 'POST':
        try:
            data = request.json
            return_id = f"RET_{int(datetime.now().timestamp())}_{user_email.split('@')[0]}"
            
            # Calculate return amount
            returned_items = data.get('returned_items', [])
            return_amount = sum(item.get('price', 0) * item.get('quantity', 1) for item in returned_items)
            
            execute_query(
                """INSERT INTO user_returns 
                   (user_email, return_id, original_order_id, return_type, return_reason,
                    return_description, returned_items, return_amount, pickup_address, images) 
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
                (user_email, return_id, data.get('order_id'), data.get('return_type'),
                 data.get('return_reason'), data.get('return_description'),
                 json.dumps(returned_items), return_amount, data.get('pickup_address'),
                 json.dumps(data.get('images', [])))
            )
            
            return jsonify({
                'success': True, 
                'message': 'Return request created successfully',
                'return_id': return_id
            }), 201
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500

def get_return_details(return_id):
    """Get specific return details"""
    user_email = get_user_email_from_token(request)
    if not user_email:
        return jsonify({'error': 'Authentication required'}), 401
    
    try:
        return_data = execute_query(
            """SELECT * FROM user_returns 
               WHERE user_email = %s AND return_id = %s""",
            (user_email, return_id),
            fetch=True
        )
        
        if not return_data:
            return jsonify({'error': 'Return request not found'}), 404
        
        return jsonify({
            'success': True,
            'return': return_data[0],
            'user_email': user_email
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def cancel_return(return_id):
    """Cancel return request"""
    user_email = get_user_email_from_token(request)
    if not user_email:
        return jsonify({'error': 'Authentication required'}), 401
    
    try:
        execute_query(
            """UPDATE user_returns 
               SET return_status = 'cancelled', updated_at = CURRENT_TIMESTAMP 
               WHERE user_email = %s AND return_id = %s AND return_status = 'requested'""",
            (user_email, return_id)
        )
        
        return jsonify({'success': True, 'message': 'Return request cancelled'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============= USER PREFERENCES =============
def user_preferences():
    """Handle user preferences"""
    user_email = get_user_email_from_token(request)
    if not user_email:
        return jsonify({'error': 'Authentication required'}), 401
    
    if request.method == 'GET':
        try:
            preferences = execute_query(
                """SELECT preferred_gender, preferred_categories, preferred_colors,
                          preferred_brands, preferred_sizes, price_range_min, price_range_max,
                          notification_settings, privacy_settings, language_preference,
                          currency_preference, created_at, updated_at 
                   FROM user_preferences 
                   WHERE user_email = %s""",
                (user_email,),
                fetch=True
            )
            
            return jsonify({
                'success': True,
                'preferences': preferences[0] if preferences else None,
                'user_email': user_email
            }), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    elif request.method == 'POST':
        try:
            data = request.json
            
            execute_query(
                """INSERT INTO user_preferences 
                   (user_email, preferred_gender, preferred_categories, preferred_colors,
                    preferred_brands, preferred_sizes, price_range_min, price_range_max,
                    notification_settings, privacy_settings, language_preference, currency_preference) 
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                   ON DUPLICATE KEY UPDATE
                   preferred_gender = VALUES(preferred_gender),
                   preferred_categories = VALUES(preferred_categories),
                   preferred_colors = VALUES(preferred_colors),
                   preferred_brands = VALUES(preferred_brands),
                   preferred_sizes = VALUES(preferred_sizes),
                   price_range_min = VALUES(price_range_min),
                   price_range_max = VALUES(price_range_max),
                   notification_settings = VALUES(notification_settings),
                   privacy_settings = VALUES(privacy_settings),
                   language_preference = VALUES(language_preference),
                   currency_preference = VALUES(currency_preference),
                   updated_at = CURRENT_TIMESTAMP""",
                (user_email, data.get('preferred_gender'), 
                 json.dumps(data.get('preferred_categories', [])),
                 json.dumps(data.get('preferred_colors', [])),
                 json.dumps(data.get('preferred_brands', [])),
                 json.dumps(data.get('preferred_sizes', [])),
                 data.get('price_range_min', 0), data.get('price_range_max', 10000),
                 json.dumps(data.get('notification_settings', {})),
                 json.dumps(data.get('privacy_settings', {})),
                 data.get('language_preference', 'en'),
                 data.get('currency_preference', 'INR'))
            )
            
            return jsonify({'success': True, 'message': 'Preferences updated'}), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500

# ============= USER NOTIFICATIONS =============
def user_notifications():
    """Handle user notifications"""
    user_email = get_user_email_from_token(request)
    if not user_email:
        return jsonify({'error': 'Authentication required'}), 401
    
    try:
        unread_only = request.args.get('unread_only', 'false').lower() == 'true'
        
        query = """SELECT id, notification_type, title, message, notification_data,
                          is_read, is_important, expires_at, created_at, read_at 
                   FROM user_notifications 
                   WHERE user_email = %s"""
        params = [user_email]
        
        if unread_only:
            query += " AND is_read = FALSE"
        
        query += " AND (expires_at IS NULL OR expires_at > NOW())"
        query += " ORDER BY is_important DESC, created_at DESC"
        
        notifications = execute_query(query, tuple(params), fetch=True)
        
        return jsonify({
            'success': True,
            'notifications': notifications or [],
            'count': len(notifications) if notifications else 0,
            'user_email': user_email
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def mark_notification_read(notification_id):
    """Mark notification as read"""
    user_email = get_user_email_from_token(request)
    if not user_email:
        return jsonify({'error': 'Authentication required'}), 401
    
    try:
        execute_query(
            """UPDATE user_notifications 
               SET is_read = TRUE, read_at = CURRENT_TIMESTAMP 
               WHERE user_email = %s AND id = %s""",
            (user_email, notification_id)
        )
        
        return jsonify({'success': True, 'message': 'Notification marked as read'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def mark_all_notifications_read():
    """Mark all notifications as read"""
    user_email = get_user_email_from_token(request)
    if not user_email:
        return jsonify({'error': 'Authentication required'}), 401
    
    try:
        execute_query(
            """UPDATE user_notifications 
               SET is_read = TRUE, read_at = CURRENT_TIMESTAMP 
               WHERE user_email = %s AND is_read = FALSE""",
            (user_email,)
        )
        
        return jsonify({'success': True, 'message': 'All notifications marked as read'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500