import os
from datetime import datetime
from dotenv import load_dotenv
from flask import Flask, request, jsonify, render_template, session, redirect, url_for, Response
from flask_sqlalchemy import SQLAlchemy
from google.oauth2 import id_token
from google.auth.transport import requests as grequests

load_dotenv()

app = Flask(__name__, static_folder="static", template_folder="templates")

# ------------------------
# Flask Config
# ------------------------
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret")
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("SQLALCHEMY_DATABASE_URI", "sqlite:///database.db")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Cookie/session hardening
app.config.update(
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",
    SESSION_COOKIE_SECURE=False if app.debug else True,  # allow HTTP in debug
)

db = SQLAlchemy(app)

GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID")

# ----------------------------
# Database Models
# ----------------------------
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    google_id = db.Column(db.String(255), unique=True)
    email = db.Column(db.String(255))
    name = db.Column(db.String(255))


class File(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, index=True)
    filename = db.Column(db.String(255))
    content = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


# ----------------------------
# Helpers
# ----------------------------
def current_user():
    uid = session.get("user_id")
    return User.query.get(uid) if uid else None


def verify_google_token(token):
    """Verify Google ID token with safer handling."""

    try:
        payload = id_token.verify_oauth2_token(
            token,
            grequests.Request(),
            GOOGLE_CLIENT_ID,
            clock_skew_in_seconds=60  # Allow clock drift
        )

        # Validate issuer
        if payload["iss"] not in ["accounts.google.com", "https://accounts.google.com"]:
            raise ValueError(f"Wrong issuer: {payload['iss']}")

        # Validate audience
        if payload["aud"] != GOOGLE_CLIENT_ID:
            raise ValueError(f"Audience mismatch: {payload['aud']}")

        return payload

    except Exception as e:
        raise ValueError(f"Google token verification failed: {e}") from e


def save_text_for_user(user_id, filename, text):
    f = File(user_id=user_id, filename=filename, content=text)
    db.session.add(f)
    db.session.commit()
    return f.id


# ----------------------------
# Routes
# ----------------------------
@app.route("/")
def index():
    return render_template("index.html", user=current_user(), google_client_id=GOOGLE_CLIENT_ID)


@app.route("/auth/google", methods=["POST"])
def auth_google():
    data = request.get_json() or {}
    token = data.get("credential")

    if not token:
        return jsonify({"error": "Missing credential"}), 400

    try:
        payload = verify_google_token(token)
    except Exception as e:
        return jsonify({"error": "Invalid Google token", "detail": str(e)}), 400

    google_id = payload["sub"]

    # Find or create user
    user = User.query.filter_by(google_id=google_id).first()
    if not user:
        user = User(
            google_id=google_id,
            email=payload.get("email"),
            name=payload.get("name")
        )
        db.session.add(user)
        db.session.commit()

    # Start Flask session
    session["user_id"] = user.id

    return jsonify({
        "success": True,
        "user": {"id": user.id, "email": user.email, "name": user.name}
    })


@app.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"success": True})


@app.route("/add_file", methods=["POST"])
def add_file():
    user = current_user()
    if not user:
        return jsonify({"error": "Not logged in"}), 401
    data = request.get_json() or {}
    filename = data.get("filename")
    content = data.get("content")
    if not filename or content is None:
        return jsonify({"error": "Missing filename or content"}), 400
    fid = save_text_for_user(user.id, filename, content)
    return jsonify({"success": True, "file_id": fid})


@app.route("/generate_example", methods=["POST"])
def generate_example():
    user = current_user()
    if not user:
        return jsonify({"error": "Not logged in"}), 401

    timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    filename = f"generated_{timestamp}.txt"
    content = (
        f"Example generated text for user {user.email}\n"
        f"Generated at: {datetime.utcnow().isoformat()}\n\n"
        "This is sample content produced by the backend generate_example endpoint."
    )
    fid = save_text_for_user(user.id, filename, content)
    return jsonify({"success": True, "file_id": fid})


@app.route("/files")
def files():
    user = current_user()
    if not user:
        return redirect(url_for("index"))

    files = File.query.filter_by(user_id=user.id).order_by(File.created_at.desc()).all()
    return render_template("files.html", user=user, files=files)


@app.route("/files/<int:file_id>")
def view_file(file_id):
    user = current_user()
    if not user:
        return jsonify({"error": "Not logged in"}), 401
    f = File.query.get_or_404(file_id)
    if f.user_id != user.id:
        return jsonify({"error": "Forbidden"}), 403
    return jsonify({
        "id": f.id,
        "filename": f.filename,
        "content": f.content,
        "created_at": f.created_at.isoformat()
    })


@app.route("/download/<int:file_id>")
def download_file(file_id):
    user = current_user()
    if not user:
        return "Not logged in", 401
    f = File.query.get_or_404(file_id)
    if f.user_id != user.id:
        return "Forbidden", 403
    return Response(
        f.content,
        mimetype="text/plain",
        headers={"Content-Disposition": f"attachment; filename={f.filename}"}
    )


@app.cli.command("init-db")
def init_db():
    db.create_all()
    print("SQLite DB initialized.")


if __name__ == "__main__":
    app.run(debug=True)
