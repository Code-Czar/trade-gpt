import os
import sys
from pathlib import Path

# assuming /var/www/trading-gpt/trading-bot-centralization-server/env is the path to your virtualenv
activate_this = (
    "/var/www/trading-gpt/trading-bot-centralization-server/env/bin/activate_this.py"
)
with open(activate_this) as file_:
    exec(file_.read(), dict(__file__=activate_this))

sys.path.append("/var/www/trading-gpt/trading-bot-centralization-server/trading_center")
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "trading_center.settings")

from django.core.wsgi import get_wsgi_application

application = get_wsgi_application()
