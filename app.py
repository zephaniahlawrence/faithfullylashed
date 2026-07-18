import sqlite3
# import hashlib
from flask import Flask, jsonify, render_template, redirect, url_for, request, session
from flask_session import Session
from flask_cors import CORS # Required for handling Cross-Origin Resource Sharing
from flask_socketio import join_room, leave_room, send, SocketIO
import requests
import random
from string import ascii_lowercase, ascii_uppercase
import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
from datetime import timedelta
import json
import ast



load_dotenv()

app = Flask(__name__)
CORS(app) # Enable CORS for all routes, adjust as needed for production

socketio = SocketIO(app, cors_allowed_origins="*")

app.secret_key = "lawrence"
app.permanent_session_lifetime = timedelta(days=1)

userdb = "userdata.db"

SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")



try:
    connection = sqlite3.connect(userdb)
    print(f"Database '{userdb}' created and connected successfully.")

    cursor = connection.cursor()
    initialization = """
        CREATE TABLE IF NOT EXISTS userdata (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fullname VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        phonenumber INTEGER NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        profileimage VARCHAR(255) NOT NULL DEFAULT 'static/images/defaultprofilepicture.png',
        membership VARCHAR(255) NOT NULL DEFAULT 'Not Subscribed',
        address VARCHAR(255) NOT NULL DEFAULT 'No Address',
        cart TEXT NOT NULL DEFAULT 'Your cart is empty.',
        purchases TEXT NOT NULL DEFAULT 'No Purchases',
        notifications TEXT NOT NULL DEFAULT 'Welcome to Faithfully Lashed!\nPrepare for relaxing at-home visits by updating your address in the profile section of your account''s dashboard!--end--',
        messagehistory TEXT DEFAULT '{"defaultmessage": "No new message history"}',
        registration TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP || ' UTC'),
        admin INTEGER DEFAULT 0
        )"""


    cursor.execute(initialization)
    print("Table 'userdata' created successfully (if it didn't exist).")
    # (DATETIME('now', 'localtime')
    # UTC - 5hrs = CST

    connection.commit()
    connection.close()
    print("Connection closed.")

except sqlite3.OperationalError as e:
    print(f"Failed to create/open database: {e}")


def get_visitor_ip():
    # Falls back to X-Forwarded-For if your app is behind a reverse proxy (Nginx/Cloudflare)
    if request.headers.getlist("X-Forwarded-For"):
        ip = request.headers.getlist("X-Forwarded-For")[0]
    else:
        ip = request.remote_addr
    return ip


def getalluserdata():
    # Connect to the database file (e.g., 'your_database.db')
    connection = sqlite3.connect(userdb)
    # Use a Row factory for easier column access (e.g., row['column_name'])
    # conn.row_factory = sqlite3.Row
    cursor = connection.cursor()

    # Execute an SQL SELECT query
    cursor.execute("SELECT * FROM userdata")

    # Fetch all the results
    results = cursor.fetchall()

    # Close the connection
    connection.close()

    users = []

    for result in results:
        user = {
            "id": result[0],
            "fullname": result[1],
            "firstname": result[1].split()[0],
            "email": result[2],
            "phonenumber": result[3],
            "password": result[4],
            "profileimage": result[5],
            "membership": result[6],
            "address": result[7],
            "cart": result[8],
            "purchases": result[9],
            "notifications": result[10].split('--end--'),
            "messagehistory": result[11],
            "registration": result[12],
            "admin": result[13]
        }

        user = {"userid": user["id"], "user": user}
        users.append(user)
        # userid = user["id"]
        # users.append({{"userid": userid}: user})
    return users





SERVICES = [
    {'id': 0, 'name': 'Classic Full Set', 'time': 2, 'price': 100, 'note':''},
    {'id': 1, 'name': 'Hybrid Full Set', 'time': 2, 'price': 125, 'note':''},
    {'id': 2, 'name': 'Volume Full Set', 'time': 2, 'price': 135, 'note':''},
    {'id': 3, 'name': 'Mega Volume Full Set', 'time': 2, 'price': 150, 'note':''},
    {'id': 4, 'name': 'Lash Lift & Tint', 'time': 1, 'price': 85, 'note': '(15% Off)'}
]




@app.route('/fetchsession', methods=['GET', 'POST'])
def fetchsession():
    currentuser = session.get("currentuser")

    print(currentuser)

    if "currentuser" not in session:
        guestuser = establishguest()
        return guestuser
    if "currentuser" in session:
        currentuser = session.get("currentuser")
        if currentuser["status"] is False or currentuser is None:
            guestuser = establishguest()
            return guestuser
        if currentuser["status"] == True:
            verifieduser = refresh_user_credentials(currentuser)
            session["currentuser"] = verifieduser
            session.modified = True
            return verifieduser
        else:
            guestuser = establishguest()
            return guestuser
    else:
        return redirect("/")


def establishguest():
    ipa = get_visitor_ip()
    guestuser = {"status": False, "id": ipa, "fullname": "Guest User", }

    session.clear()
    app.permanent_session_lifetime = timedelta(hours=1)
    session.permanent = True
    session["currentuser"] = guestuser

    return guestuser




@app.route('/register', methods=['POST'])
def register():
    if request.method == 'POST' and 'useremail' in request.form:
        registrationdata = {
            "fullname": request.form.get('userfullname'),
            "phonenumberraw": request.form.get('userphone'),
            "phonenumber": request.form.get('userphone').replace("-",''),
            "email": request.form.get('useremail'),
            "password": request.form.get('userpassword'),
            "registration": True
        }
        save_to_database(registrationdata)

        recipient = registrationdata["email"]
        subject = f"Welcome to Faitfully Lashed, {registrationdata['fullname']}!"
        body = f"Welcome to Faithfully Lashed, {registrationdata['fullname']}!\n\nYou've successfully registered your account with us!\n\nFor future reference, sign into your account using either your phone number or email!\n\nLastly, please confirm your account information below and remember to keep it safe.\n\nIf there's an issue with your information below, please send a response to this email with the problem detailed within it.\n\nE-mail: {registrationdata['email']}\nPhone Number: {registrationdata['phonenumberraw']}\nPassword: {registrationdata['password']}\n\nThanks again for signing up with Faithfully Lashed!"
        send_email(recipient, subject, body)

        return 'Registered successfully!'

    else:
        return 'No form submitted.'


@app.route('/signin', methods=['POST'])
def signin():
    if (request.method == 'POST') and ('usersignin' or 'passwordsignin' in request.form):
        usersigninraw = request.form.get('usersignin')
        usersignin = usersigninraw.replace("-", '')
        passwordsignin = request.form.get('passwordsignin')

        usercheck = check_user_credentials(usersignin, passwordsignin)

        if usercheck["status"] is True:
            app.permanent_session_lifetime = timedelta(days=1)
            session.permanent = True
            currentuser = usercheck
            session["currentuser"] = currentuser
            # session.modified = True
            return currentuser
        elif usercheck["status"] is False:
            return usercheck["message"]
    else:
        return 'No form submitted.'


@app.route("/logout")
def logout():
    establishguest()
    return redirect("/")



@app.route("/", methods=['GET', 'POST'])
def index():
    return render_template("index.html", services=SERVICES)


@app.route('/cart', methods=['GET', 'POST'])
def cart():
    targetkey = "message"

    cartitems = []
    total = 0
    if 'cart' not in session:
            session['cart'] = []
    session['cart'] = session.get('cart')
    cart = session['cart']
    if cart:
        matchingkey = any(targetkey in i for i in cart)
        if matchingkey is True:
            cartitems = []
            total = None
        if matchingkey is False:
            cartitems = cart['cart']
            total = cart['total']
    return render_template('dynamiccart.html', services=SERVICES, cartitems=cartitems, total=total)

@app.route('/populateservices', methods=['GET', 'POST'])
def populateservices():
    services=SERVICES
    return services



@app.route('/updatecart', methods=['GET', 'POST'])
def updatecart():
    services=SERVICES
    currentuser = session.get("currentuser")
    userid = currentuser["id"]
    targetkey = "total"
    targetkey2 = "message"

    if request.method == 'POST' and 'serviceid' in request.form:
        serviceid = int(request.form.get('serviceid'))
        service = services[serviceid]

        if 'cart' not in session:
            session['cart'] = []
            total = 0

        session['cart'] = session.get('cart')
        cartsession = session['cart']

        matchingkey2 = any(targetkey2 in i for i in cartsession)
        if matchingkey2 is True:
            session['cart'] = []
            cart = session['cart']
        else:
            matchingkey = any(targetkey in i for i in cartsession)
            if matchingkey is True:
                cart = cartsession['cart']
            if matchingkey is False:
                cart = cartsession
        total = 0
        if not cart:
            cartitem = {"serviceid": serviceid, "name": service["name"], "quantity": 1, "price": service["price"], "subtotal": service["price"]}
            cart.append(cartitem)
            # print(f"{serviceid} was added to your cart.")
        else:
            print(f"1: {cart}")
            # Returns True if the key is found in any dictionary
            # matchingkey = any(targetkey in i for i in cart)
            # matchingdict = next((d for d in cart if targetkey in d), False)
            for item in cart:
                if serviceid == item["serviceid"]:
                    item["quantity"] += 1
                    quantity = item["quantity"]
                    subtotal = item["price"] * quantity
                    cartitem = {"serviceid": serviceid, "name": service["name"], "quantity": quantity, "price": service["price"], "subtotal": subtotal}
                    cart.remove(item)
                else:
                    cartitem = {"serviceid": serviceid, "name": service["name"], "quantity": 1, "price": service["price"], "subtotal": service["price"]}
            cart.append(cartitem)
        for item in cart:
            total += item["subtotal"]
        cartinfo = {"cart": cart, "total": total}
        session['cart'] = cartinfo
        cartdata = str(cartinfo)
        savecart(cartdata, userid)
        print(f"cartinfo: {cartinfo}")
        return jsonify(cartinfo)
    else:
        message = "Your cart is empty."
        formattedmessage = {"message": message}
        session['cart'] = formattedmessage
        savecart(message, userid)
        return formattedmessage


@app.route("/services")
def services():
    return render_template("services.html", services=SERVICES)


@app.route('/clear_cart')
def clear_cart():
    session.pop('cart', None)
    session.clear()
    return redirect("/updatecart")







@app.route('/updateprofile', methods=['GET', 'POST'])
def update_profile():
    currentuser = session.get("currentuser")
    oldpasswordrecord = currentuser["password"]
    processcode = None

    if request.method == 'POST' and 'fullnameupdate' or 'phonenumberupdate' or 'emailupdate' or 'addressupdate' or 'file' or 'oldpassword' or 'newpassword' or 'newpasswordconfirmation' in request.form or request.files:
        updatedata = {
            "userid": currentuser["id"],
            "username": currentuser["fullname"],
            "fullnameupdate": request.form.get('fullnameupdate'),
            "phonenumberupdate": request.form.get('phonenumberupdate'),
            "emailupdate": request.form.get('emailupdate'),
            "addressupdate": request.form.get('addressupdate'),
            # "addressupdate": {"addressupdate": request.form.get('addressupdate'), "status": False}
            # "file": request.files['file'],
            "file": request.files.get('file'),
            # "file": None,
            "oldpassword": request.form.get('oldpassword'),
            "newpassword": request.form.get('newpassword'),
            "newpasswordconfirmation": request.form.get('newpasswordconfirmation'),
            "oldpasswordrecord": oldpasswordrecord,
            "passwordverified": False,
            "filepath": None
        }

        print(f"ud: {updatedata}")

        for update in updatedata:
            if update:
                if update is not updatedata["file"]:
                    # 805 Bradyville Pike APT O3, Murfreesboro, TN 37130
                    # updatedata = {k: (v if k == "addressupdate" or k == "passwordverified" else None) for k, v in updatedata.items()}
                    status = save_to_database(update)
                    pass
                elif "file":
                    status = processprofileimage(update)
                    if status == True:
                        print("8")
                        pass
                    pass
                else:
                    status = processpasswordchange(update)


        if updatedata["oldpassword"] and updatedata["oldpassword"] == oldpasswordrecord:
            if updatedata["newpassword"] and updatedata["newpasswordconfirmation"]:
                if updatedata["newpassword"] == updatedata["newpasswordconfirmation"]:
                    updatedata["passwordverified"] = True
                    status = save_to_database(updatedata)
                    processcode = {"status": True, "message": 'Password updated successfully.', "code": 500}
                    return processcode
                elif updatedata["newpassword"] != updatedata["newpasswordconfirmation"]:
                    errorcode = {"status": False, "message": 'Password confirmation does not match new password.', "code": 501}
                    return errorcode
            elif not updatedata["newpassword"] or not updatedata["newpasswordconfirmation"]:
                errorcode = {"status": False, "message": 'Provide new password and/or new password confirmation.', "code": 501}
                return errorcode
        elif updatedata["oldpassword"] and updatedata["oldpassword"] != oldpasswordrecord:
            errorcode = {"status": False, "message": 'Incorrect password.', "code": 501}
            return errorcode
        else:
            processcode = {"status": True, "message": 'Profile successfully updated.', "code": 201}
            return processcode
    else:
        errorcode = {"status": False, "message": 'No submissions present', "code": 501}
        return errorcode




def processprofileimage(updatedata):
    app.config['MAX_CONTENT_LENGTH'] = 8 * 1024 * 1024
    app.config['UPLOAD_FOLDER'] = f"profileimages/{updatedata['username']}"
    UPLOAD_FOLDER = f"static/profileimages/{updatedata['username']}"
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

    # Secure and save the file
    filename = secure_filename(updatedata["file"].filename)
    updatedata["file"].save(os.path.join(UPLOAD_FOLDER, filename))
    filepath = f"static/profileimages/{updatedata['username']}/{filename}"
    # print(filepath)
    updatedata["filepath"] = filepath
    save_to_database(updatedata)
    returncode = {"status": True, "message": 'Profile image updated successfully.', "code": 201}
    return returncode


def savecart(cartinfo, userid):
    connection = sqlite3.connect(userdb)
    cursor = connection.cursor()
    print("24")
    try:
        # SQL statement with placeholders
        sql = "UPDATE userdata SET cart = ? WHERE id = ?"
        # Execute the statement with data as a tuple
        cursor.execute(sql, (cartinfo, userid))

        # Commit the changes to the database
        connection.commit()
        print("Data committed successfully.")

    except sqlite3.Error as e:
        print(f"Database error: {e}")
        # Handle the error appropriately
    finally:
        # Always close the connection
        connection.close()
        print("Connection closed successfully.")




def displayuserdata():
    connection = sqlite3.connect(userdb)
    cursor = connection.cursor()

    try:
        # SQL statement with placeholders
        sql = "SELECT * FROM userdata"
        # Execute the statement with data as a tuple
        cursor.execute(sql)

        # Commit the changes to the database
        connection.commit()
        print("Data committed successfully.")

    except sqlite3.Error as e:
        print(f"Database error: {e}")
        # Handle the error appropriately
    finally:
        # Always close the connection
        connection.close()
        print("Connection closed successfully.")








def check_user_credentials(usersignin, passwordsignin):
    connection = sqlite3.connect(userdb) # Connect to the database
    cursor = connection.cursor()

    # Use a prepared statement to safely query the database
    query = "SELECT * FROM userdata WHERE email = ? OR phonenumber = ?"
    # print([(user_input)])
    cursor.execute(query, (usersignin, usersignin))

    # Fetch the first matching row
    result = cursor.fetchone()
    connection.close()

    if result:
        # A user was found, now compare the password (e.g., using a secure hash comparison)
        # id = result[0]; fullname = result[1]; email = result[2]; phonenumber = result[3]; password = result[4]; profileimage = result[5]; membership = result[6]; address = result[7]; cart = result[8]; purchases = result[9]; notifications = result[10]; registration = result[11]; admin = result[12]
        user = {
            "status": None,
            "message": None,
            "id": result[0],
            "fullname": result[1],
            "firstname": result[1].split()[0],
            "email": result[2],
            "phonenumberraw":result[3],
            "phonenumber": str(result[3]).replace("-", ''),
            "password": result[4],
            "profileimage": result[5],
            "membership": result[6],
            "address": result[7],
            "cart": result[8],
            "purchases": result[9],
            "notifications": result[10].split('--end--'),
            "messagehistory": result[11],
            "registration": result[12],
            "admin": result[13],
            "userdata": None
        }
        if user["admin"] == 1:
            userdata = getalluserdata()
            user["userdata"] = userdata

        # In a real application, you would use a secure library to compare hashes
        if user["password"] == passwordsignin: # Simplified comparison
            user["status"] = True
            user["message"] = f"Welcome back, {user['firstname']}!"
            return user  # Credentials match
        elif user["password"] != passwordsignin:
            user = {"status": False, "message": "Incorrect password."}
            return user
    else:
        user = {"status": False, "message": f"User '{usersignin}' not found."}
        return user



def refresh_user_credentials(sessionuser):
    existinguser = check_user_credentials(sessionuser["email"], sessionuser["password"])
    if sessionuser["id"] != existinguser["id"]:
        guestuser = establishguest()
        return guestuser
    elif sessionuser["id"] == existinguser["id"]:
        session["currentuser"] = existinguser
        # session["currentuser"] = sessionuser
        return existinguser




def save_to_database(updatedata):
    update_map = {
        "fullnameupdate": ("fullname", "fullnameupdate"),
        "phonenumberupdate": ("phonenumber", "phonenumberupdateraw"),
        "emailupdate": ("email", "emailupdate"),
        "addressupdate": ("address", "addressupdate"),
        "filepath": ("profileimage", "filepath"),
        "passwordverified": ("password", "newpassword"),
        "notifications": ("notifications", "notifications")
        # "chatstatus": ("messagehistory", json.dumps(updatedata)),
    }

    connection = sqlite3.connect(userdb)
    # with sqlite3.connect(userdb) as connection:
    cursor = connection.cursor()
    print(f"mh: {updatedata}")
    try:
        if updatedata.get("registration"):
            # SQL statement with placeholders
            sql = "INSERT INTO userdata (fullname, phonenumber, email, password) VALUES (?, ?, ?, ?)"
            # Execute the statement with data as a tuple
            cursor.execute(sql, (updatedata["fullname"], updatedata["phonenumber"], updatedata["email"], updatedata["password"]))

        elif updatedata.get("chatstatus") == True:
            print("message history updated")
            # SQL statement with placeholders
            sql = "UPDATE userdata SET messagehistory = ? WHERE id IN (?, 1)"
            # Execute the statement with data as a tuple
            cursor.execute(sql, (json.dumps(updatedata), updatedata["userid"]))

        else:
            for updatekey, (databasecolumn, updatetype) in update_map.items():
                if updatekey in updatedata:
                    cursor.execute(f"UPDATE userdata SET {databasecolumn} = ? WHERE id = ?", (updatedata[updatetype], updatedata["userid"]))
                    break

        # Commit the changes to the database
        connection.commit()
        print("Data committed successfully.")

    except sqlite3.Error as e:
        print(f"Database error: {e}")
        return False
        # Handle the error appropriately
    finally:
        # Always close the connection
        connection.close()
        print("Connection closed successfully.")
        return True



def send_email(recipient_email, subject, body):
    try:
        msg = MIMEMultipart()
        msg['From'] = EMAIL_ADDRESS
        msg['To'] = recipient_email
        msg['Subject'] = subject

        msg.attach(MIMEText(body, 'plain'))

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            server.sendmail(EMAIL_ADDRESS, recipient_email, msg.as_string())

        print("E-mail sent successfully. Return Code 200 OK Successful")
    except Exception as e:
        if e == "(334, b'UGFzc3dvcmQ6')":
            print(f"Error sending e-mail:{e}, failed authentication.")
        else:
            print(f"Error sending e-mail:{e}, failed authentication.")


def generate_unique_code(subject):
    while True:
        code = ""
        for _ in range(subject):
            code += random.choice(ascii_uppercase)
        return code






@app.route("/room", methods=["GET", "POST"])
def room():
    existingchat = request.form.get('existingchat')
    adminexistingchat = request.form.get('adminexistingchat')
    adminexistingchatuserid = request.form.get('adminexistingchatuserid')
    subject = request.form.get('newchatsubject')
    adminsubject = request.form.get('adminnewchatsubject')


    currentuser = session.get("currentuser")

    if currentuser["status"]:
        messagehistory = currentuser["messagehistory"]
        if not isinstance(messagehistory, dict):
            messagehistory = json.loads(messagehistory)



    roomcode = None

    if currentuser["status"] is False or currentuser is None:
        nonuserstatus = {"status": False, "error": "Please sign in or create an account to chat with us."}
        return nonuserstatus

    if subject:
        code = generate_unique_code(len(subject))
        roomcode = f"FL{currentuser['id']}{code}0001"

    if adminsubject:
        code = generate_unique_code(len(adminsubject))
        roomcode = f"FL{currentuser['id']}{code}0001"

    if existingchat:
        roomcode = existingchat

    if adminexistingchat:
        roomcode = adminexistingchat
        # messagehistory["userid"] = currentuser["id"]
        messagehistory[roomcode]["userid"] = adminexistingchatuserid
        messagehistory[roomcode]["username"] = currentuser["fullname"]
        # print(f"adminexistingchat: {adminexistingchat}")

    if not roomcode or messagehistory is None:
        nonuserstatus = {"status": False, "error": "Please sign in or create an account to chat with us."}
        return nonuserstatus

    # print(f"chatrooms: {messagehistory['chatrooms']}")
    if roomcode not in messagehistory:
        # print("nrc")
        messagehistory["chatstatus"] = True
        # messagehistory["userid"] = currentuser["id"]
        # messagehistory[{"roomcode": roomcode}] = {
        #     "status": True,
        #     "userid": currentuser["id"],
        #     "username": currentuser["fullname"],
        #     "roomcode": roomcode,
        #     "subject": subject,
        #     "members": 0,
        #     "messagehistory": []
        # }
        messagehistory[roomcode] = {
            "roomstatus": True,
            "userid": currentuser["id"],
            "roominfo": {
                "status": True,
                "userid": currentuser["id"],
                "username": currentuser["fullname"],
                "roomcode": roomcode,
                "subject": subject,
                "members": 0,
                "messagehistory": []
            }
        }

    if roomcode in messagehistory:
        # currentroom = messagehistory[roomcode]
        currentroom = messagehistory[roomcode]["roominfo"]

    # print(f"currentroom: {messagehistory["roominfo"]}")


    session["currentuser"]["messagehistory"] = messagehistory
    session["currentroom"] = currentroom
    session.modified = True
    print(f"sessionuser3: {session['currentuser']['messagehistory']}")
    save_to_database(messagehistory)
    return currentroom




@socketio.on("newmessage")
def message(newmessage):
    currentuser = session.get("currentuser")
    currentroom = session.get("currentroom")
    messagehistory = currentuser["messagehistory"]

    roomcode = currentroom["roomcode"]
    username = currentroom["username"]
    # print(f"cr {messagehistory["chatrooms"]}")
    if roomcode not in messagehistory:
        return

    # if newmessage.get("message"):
    messagecontent = {"status": True, "name": username, "message": newmessage["message"]}
    send(messagecontent, to=roomcode)

    messagehistory[roomcode]["roominfo"]["messagehistory"].append(messagecontent)
    session["currentuser"]["messagehistory"] = messagehistory
    session.modified = True

    # print(f"paps{messagehistory}")
    save_to_database(messagehistory)


    # print(f"{username} sent: {newmessage['message']} {newmessage['adminmessage']}", messagehistory["chatrooms"][roomcode]["messagehistory"])





@socketio.on("connect")
def connect(auth):
    # print("1")
    currentuser = session.get("currentuser")
    currentroom = session.get("currentroom")
    messagehistory = currentuser["messagehistory"]

    if not currentroom:
        return

    roomcode = currentroom["roomcode"]

    # print(f"roomcode: {roomcode}, chatrooms: {messagehistory["chatrooms"]}")
    if not currentroom or not currentuser["fullname"]:
        return
    if roomcode not in messagehistory:
        print("3")
        leave_room(roomcode)
        return

    join_room(roomcode)

    messagedata = {"status": False, "name": currentuser["fullname"], "message": "has entered this chat"}
    send(messagedata, to=roomcode)

    messagehistory[roomcode]["roominfo"]["members"] += 1

    # save_to_database(messagehistory)
    # rooms[room]["messages"].append(messagecontent)
    # print(f"{currentuser["fullname"]} joined room {roomdata["roomcode"]}")


# @app.route("/endchat", methods=["GET", "POST"])
# def disconnect():
#     return rooms

@socketio.on("disconnect")
def disconnect(auth):
    currentuser = session.get("currentuser")
    currentroom = session.get("currentroom")
    messagehistory = currentuser["messagehistory"]
    roomcode = currentroom["roomcode"]

    leave_room(roomcode)

    if roomcode in messagehistory:
        messagehistory[roomcode]["roominfo"]["members"] -= 1
        # if messagehistory[roomcode]["members"] <= 0:
        #     del messagehistory[roomcode]

    messagedata = {
        "status": False,
        "name": currentuser["fullname"],
        "message": "has left the room"
    }

    send(messagedata, to=roomcode)

    session['currentuser']['messagehistory'] = messagehistory
    session.modified = True
    save_to_database(messagehistory)

    # print(f"sessionuser4: {session['currentuser']['messagehistory']}")

if __name__ == "__main__":
    # app.run(debug=True)
    socketio.run(app, debug=True)
# gunicorn --worker-class eventlet -w 1 app:app

