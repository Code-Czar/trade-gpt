install:
	cd trading-bot-backend && yarn install
	cd ..
	cd trading-bot-frontend && yarn install
	cd ..
	cd trading-bot-position-manager && yarn install
	cd ..
	cd trading-bot-strategy-analyzer && yarn install
	cd ..
	cd trading-bot-centralization-server && \
		python3 -m virtualenv env && \
		source env/bin/activate && \
		pip install -r requirements.txt \
		cd ..

build:
	cd trading-bot-backend && yarn build
	cd ..
	cd trading-bot-frontend && yarn build
	cd ..
	cd trading-bot-position-manager && yarn build
	cd ..
	cd trading-bot-strategy-analyzer && yarn build
	cd ..
