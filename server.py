from flask import Flask, jsonify, request, redirect
import bcrypt
import uuid
import pg
import os


db = pg.DB(dbname='ecommerce_db')
app = Flask('ecommerceApp', static_url_path='')

stripe_api_key = 'sk_test_2f3Kpy0pky5uFJ5ZIQBYoWaY'


@app.route('/')
def home():
    return app.send_static_file('index.html')


@app.route('/api/products')
def products():
    results = db.query('SELECT * FROM product').dictresult()
    return jsonify(results)


@app.route('/api/products/<prod_id>')
def products_prod_id(prod_id):
    results = db.query(
        'SELECT * FROM product, album_in_product WHERE album_in_product.product_id = $1 AND product.id = $1', prod_id).dictresult()
    return jsonify(results)


@app.route('/api/user/signup', methods=['POST'])
def signup():
    data = request.get_json()
    password = data['password']  # the entered password
    salt = bcrypt.gensalt()  # generate a salt
    # now generate the encrypted password
    encrypted_password = bcrypt.hashpw(password.encode('utf-8'), salt)
    return jsonify(db.insert('customer', {
        'username': data['username'],
        'email': data['email'],
        'first_name': data['first_name'],
        'last_name': data['last_name'],
        'password': encrypted_password
    }))


@app.route('/api/user/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data['username']
    password = data['password']  # the entered password
    customer = db.query(
        'SELECT * FROM customer WHERE customer.username = $1', username).namedresult()[0]
    print "This is named result", db.query('SELECT * FROM customer WHERE customer.username = $1', username).namedresult()
    encrypted_password = customer.password
    customer_id = customer.id
    # the following line will take the original salt that was used
    # in the generation of the encrypted password, which is stored as
    # part of the encrypted_password, and hash it with the entered password
    rehash = bcrypt.hashpw(password.encode('utf-8'), encrypted_password)
    if rehash == encrypted_password:
        token = uuid.uuid4()
        db.insert('auth_token', {
            'token': token,
            'customer_id': customer_id
        })
        login_success = {"username": customer.username, "token": token}
        return jsonify(login_success)
    else:
        return "Incorrect password", 401


@app.route('/api/shopping_cart', methods=['POST'])
def add_product_to_cart():
    data = request.get_json()
    sent_token = data.get('token')
    product_id = data.get('product_id')
    customer = db.query(
        'SELECT * FROM auth_token WHERE token = $1', sent_token).namedresult()
    if customer == []:
        return "Forbidden", 403
    else:
        customer_id = customer[0].customer_id
        customer_token = customer[0].token
        db.insert('product_in_shopping_cart', {
            'product_id': product_id,
            'customer_id': customer_id
        })
        return jsonify(customer)


@app.route('/api/shopping_cart')
def view_cart():
    sent_token = request.args.get('token')
    # customer_token = db.query('SELECT * FROM auth_token WHERE token = $1', sent_token).namedresult()[0].token
    customer = db.query(
        'SELECT * FROM auth_token WHERE token = $1', sent_token).namedresult()
    if customer == []:
        return "Forbidden", 403
    else:
        total_price = db.query("""
        SELECT sum(price)
            FROM product_in_shopping_cart
            INNER JOIN product ON product.id = product_id
            INNER JOIN auth_token ON auth_token.customer_id = product_in_shopping_cart.customer_id
            WHERE auth_token.token = $1""", sent_token).namedresult()[0].sum
        results = db.query('''
        SELECT product.name as "product", product.price as "price"
            FROM product_in_shopping_cart
            INNER JOIN product ON product.id = product_id
            INNER JOIN auth_token ON auth_token.customer_id = product_in_shopping_cart.customer_id
            WHERE auth_token.token = $1''', sent_token).dictresult()
        return jsonify(results, total_price)


@app.route('/api/shopping_cart/checkout', methods=['POST'])
def checkout():
    data = request.get_json()
    sent_token = data.get('token')
    address = data.get('shipping_address')
    customer = db.query(
        'SELECT * FROM auth_token WHERE token = $1', sent_token).namedresult()
    if customer == []:
        return "Forbidden", 403
    else:
        customer_id = customer[0].customer_id
        customer_token = customer[0].token
        purchased_items = db.query("""
        SELECT price, product.name
            FROM product_in_shopping_cart
            INNER JOIN product ON product.id = product_id
            INNER JOIN auth_token ON auth_token.customer_id = product_in_shopping_cart.customer_id
            WHERE auth_token.token = $1""", customer_token).dictresult()
        total_price = db.query("""
        SELECT sum(price)
            FROM product_in_shopping_cart
            INNER JOIN product ON product.id = product_id
            INNER JOIN auth_token ON auth_token.customer_id = product_in_shopping_cart.customer_id
            WHERE auth_token.token = $1""", customer_token).namedresult()[0].sum
        result = db.insert('purchase', {
            'customer_id': customer_id,
            'total_price': total_price,
            'shipping_address': address
        })
        return jsonify(result, purchased_items)


if __name__ == '__main__':
    app.run(debug=True)
