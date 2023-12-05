SHELL := /bin/bash
NVM_DIR := $(HOME)/.nvm
REQUIRED_NODE_VERSION := v18.0
SHARED_LIB_NAME := trading-shared


install_screen:
	if ! command -v screen &>/dev/null; then \
		sudo apt-get install -y screen; \
	fi

install_nvm:
	if [ ! -d "$(NVM_DIR)" ]; then \
		curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash; \
	fi

install_node: install_nvm
	. $(NVM_DIR)/nvm.sh && \
	(node --version | grep -q "$(REQUIRED_NODE_VERSION)" || (nvm install $(REQUIRED_NODE_VERSION) && nvm use $(REQUIRED_NODE_VERSION)))

install_typescript:
	if ! command -v tsc &>/dev/null; then \
		npm install -g typescript; \
	fi

install_certbot:
	sudo apt-get update
	sudo apt-get install -y software-properties-common
	sudo apt-get update
	sudo apt-get install -y certbot python3-certbot-apache

install_ssl: install_certbot
	sudo systemctl stop apache2
	sudo certbot certonly --standalone -d beniben.hopto.org
	sudo systemctl start apache2

install_apache_config:
	# Assuming the Apache config file is located at trading-bot-backend/apache/backend-server-apache.conf
	sudo cp trading-bot-backend/apache/backend-server-apache.conf /etc/apache2/sites-available/
	sudo a2ensite backend-server-apache.conf
	sudo a2enmod proxy_wstunnel
	sudo a2enmod rewrite

	sudo systemctl reload apache2

deploy_android:
	cd SimpleFrontend && ./deployCordova.sh

link_shared_lib:
	# Link the shared library globally
	cd Shared && yarn link
	# Link the shared library in each project
	cd trading-bot-backend && yarn link "$(SHARED_LIB_NAME)"
	cd SimpleFrontEnd/desktop && yarn add --force ../../Shared
	cd trading-bot-strategy-analyzer && yarn link "$(SHARED_LIB_NAME)"

install_backend: install_node link_shared_lib
	cd trading-bot-backend && yarn install

install_frontend: install_backend
	cd trading-bot-frontend && yarn install

install_position_manager: install_frontend
	cd trading-bot-position-manager && yarn install

install_strategy_analyzer: install_position_manager
	cd trading-bot-strategy-analyzer && yarn install

install_centralization_server: install_strategy_analyzer
	cd trading-bot-centralization-server && \
	python3 -m virtualenv env && \
	source env/bin/activate && \
	pip install -r requirements.txt

install: install_centralization_server install_ssl install_apache_config

deploy_staging:
	./deployToServer.sh staging

deploy_production:
	./deployToServer.sh production
