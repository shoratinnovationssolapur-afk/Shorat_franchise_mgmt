import os
from pathlib import Path
from dotenv import load_dotenv
import dj_database_url

# BASE
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

# ── Core ─────────────────────────────────────────────────────────
DEBUG = os.getenv("DEBUG", "False").lower() == "true"
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-me")
DEFAULT_USER_PASSWORD = os.getenv("DEFAULT_USER_PASSWORD", "")

# ALLOWED HOSTS and CSRF trusted origins (include exact frontend origin)
ALLOWED_HOSTS = [
    "localhost",
    "127.0.0.1",
    "franchise-management-system-for-deploy-1.onrender.com",   # backend on Render

    "franchise-management-system-for-deploy1.onrender.com",    # frontend host (without https prefix)
    ".onrender.com",
    "https://franchise.shoratinnovations.com",

]

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://franchise-management-system-for-deploy-1.onrender.com",
    "https://franchise-management-system-for-deploy1.onrender.com",
    "https://franchise.shoratinnovations.com",
]

# ── Apps ─────────────────────────────────────────────────────────
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    "corsheaders",
    "rest_framework",
    "rest_framework_simplejwt.token_blacklist",

    # your apps
    "admin1.add_franchise.apps.AddFranchiseConfig",
    "admin1.accounts",
    "admin1.add_event",
    "admin1.profiles",
    "admin1.add_course",
    "Franchise.add_student",
    "admin1.add_staff",
    "admin1.notifications.apps.NotificationsConfig",
    "admin1.add_batch",
    "admin1.attendance",
    "admin1.leave_management",
    "admin1.inventory",
]

# ── Middleware (order matters) ───────────────────────────────────
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",            # Must be high to handle preflight BEFORE CommonMiddleware
    "whitenoise.middleware.WhiteNoiseMiddleware",       # serve static files
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "backend_project.urls"
AUTH_USER_MODEL = "accounts.User"  # OK if app label is 'accounts'

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "backend_project.wsgi.application"

# ── Database (Render → DATABASE_URL; fallback to sqlite) ─────────
DATABASE_URL = os.environ.get('DATABASE_URL')

if DATABASE_URL:
    ssl_require = DATABASE_URL.startswith(("postgres://", "postgresql://"))
    DATABASES = {
        'default': dj_database_url.parse(
            DATABASE_URL,
            conn_max_age=0,
            ssl_require=ssl_require,
        )
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

# ── Passwords ────────────────────────────────────────────────────
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# ── i18n ─────────────────────────────────────────────────────────
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# ── Static / Media via WhiteNoise ────────────────────────────────
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# ── CORS ─────────────────────────────────────────────────────────
# Add exact origins (include https://) — frontend origin is critical and must match browser origin
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://franchise-management-system-for-deploy1.onrender.com",   # frontend (exact)
    "https://franchise-management-system-for-deploy-1.onrender.com",  # backend origin (if needed)
    "https://franchise.shoratinnovations.com",
]

# Allow credentials only if you actually use cookies; otherwise OK to leave True when using JWTs.
CORS_ALLOW_CREDENTIALS = True

# Allow common headers and Authorization
from corsheaders.defaults import default_headers, default_methods

CORS_ALLOW_HEADERS = list(default_headers) + [
    "authorization",
    "content-type",
    "x-csrftoken",
]

# Optionally include extra methods
CORS_ALLOW_METHODS = list(default_methods) + [
    "PATCH",
]

# ── DRF & JWT ───────────────────────────────────────────────────
from datetime import timedelta

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
}

# ── Email (move secrets to env) ──────────────────────────────────
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = "smtp.gmail.com"
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER", "")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD", "")
DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", EMAIL_HOST_USER)


# WhatsApp reminders via Twilio WhatsApp API
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID", "")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN", "")
TWILIO_WHATSAPP_FROM = os.getenv("TWILIO_WHATSAPP_FROM", "")
DEFAULT_WHATSAPP_COUNTRY_CODE = os.getenv("DEFAULT_WHATSAPP_COUNTRY_CODE", "+91")


# Web Push notifications
WEB_PUSH_VAPID_PRIVATE_KEY = os.getenv("WEB_PUSH_VAPID_PRIVATE_KEY", "")
WEB_PUSH_VAPID_PUBLIC_KEY = os.getenv("WEB_PUSH_VAPID_PUBLIC_KEY", "")
WEB_PUSH_VAPID_CLAIMS = {
    "sub": os.getenv("WEB_PUSH_VAPID_SUBJECT", f"mailto:{DEFAULT_FROM_EMAIL}")
}


# ── Security behind Render proxy ─────────────────────────────────
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
if not DEBUG:
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = 60
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
