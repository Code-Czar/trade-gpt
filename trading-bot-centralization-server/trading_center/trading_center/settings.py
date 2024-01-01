"""
Django settings for trading_center project.

Generated by 'django-admin startproject' using Django 4.2.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/4.2/ref/settings/
"""

from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = "django-insecure-!^x0%c%ko1-8-cas0vi35gae+&i8t=cw5qytl#!+tij+j4yxhe"

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ["*"]
CORS_ALLOW_ALL_ORIGINS = True

# SSL
# SECURE_SSL_REDIRECT = True  # Redirect all HTTP traffic to HTTPS
# SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')  # If behind a proxy
SESSION_COOKIE_SECURE = True  # Send the session cookie only over HTTPS
CSRF_COOKIE_SECURE = True  # Send the CSRF cookie only over HTTPS


STATIC_URL = "static/"
STATIC_ROOT = (
    "/var/www/trading-gpt/trading-bot-centralization-server/trading_center/staticfiles"
)
# STRIPE_SECRET_KEY = 'pk_test_51OGQQoJ5PV7GuigYwTYVEmyl3e1kT9jh6Oh859hcIQo6xDFh21HMWfUJexNE4oZ9bwtlfctUSbWXw0wdmX4srovX00jEAc9PgN'

STRIPE_PUB_KEY = "pk_test_51OGQQoJ5PV7GuigYwTYVEmyl3e1kT9jh6Oh859hcIQo6xDFh21HMWfUJexNE4oZ9bwtlfctUSbWXw0wdmX4srovX00jEAc9PgN"
STRIPE_SEC_KEY = "sk_test_51OGQQoJ5PV7GuigYkHHZCrpRqJ4splbWJMC5OuriyMlIgCy89xCPv4pXaeI03GzGZIESNJGzaJQCukbd47kpBxQd00hijhGDee"
STRIPE_WEBHOOK_SECRET = "whsec_KkF4KQkVtDtd3Nytr4meaUc57HI34VhC"

# Application definition

INSTALLED_APPS = [
    "corsheaders",
    "rest_framework",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django_extensions",
    "trading_center",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "trading_center.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "trading_center.wsgi.application"


# Database
# https://docs.djangoproject.com/en/4.2/ref/settings/#databases

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}


# Password validation
# https://docs.djangoproject.com/en/4.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# Internationalization
# https://docs.djangoproject.com/en/4.2/topics/i18n/

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.2/howto/static-files/

STATIC_URL = "static/"

# Default primary key field type
# https://docs.djangoproject.com/en/4.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# APPEND_SLASH = False
