# Stocks Competition
A competition where participants enter a predetermined amount of money into a Trading212 account and compete to earn the most
money over a set period of time. This repository contains the server and user interface for the website to track the values and 
open positions of all participants over the course of the competition using the [Trading212 API](https://t212public-api-docs.redoc.ly/).

## Getting Started
This project uses Discord to validate users are real and to send notifications if action is required. A server must be set up that
participants can join before signing up for the competition. To allow the project to interact with the discord server,
[create a discord application](https://discord.com/developers/docs/getting-started) with permissions to send messages and add it
to the server.
### Environment

- [Install MariaDb](https://hub.docker.com/_/mariadb)
- [Install Redis](https://hub.docker.com/_/redis)

MariaDb and Redis must be running before starting the application or 3 of the 4 applications will not start.

### Project
Environment variables are stored in git ignored .env and .json files. Before running the project, copy the contents of ```.env.example```,
```.env.client.example``` and ```database/database.example.json``` into new files called ```.env```, ```.env.client``` and 
```database/database.json```, filling in the values that need updating. If running outside of docker the ```.env``` file will also have to be copied into the ```api```, ```data-fetcher``` and ```socket-server```
directories inside the ```applications``` directory.

From the root directory of the project run:
- ```npm install```
- With MariaDb running ```npx sequelize-cli db:migrate -env development```
- If using docker:
  - ```docker compose build```

The project can then be run by either running ```docker compose up``` or individually calling ```npm run``` on the applications to launch

## Applications
With the exception of the client, each application listed below can be run independently of each other and do not require
any of the applications to be running. While the client application will start without any of the other project running, the API
application must be running for any of its features to work.

<div style="text-align: center">
    <img alt="Stocks competition system diagram" src="../StocksCompetitionPOC/.github/diagrams/stocks-competition-design.png"/>
</div>

### API
An Express REST API that is used to:

- Create and authenticate user accounts
- Create and read social elements (comments / likes)
- Format and return data retrieved by the Data Fetcher application

### Client
React application used to interact with the stocks competition and display data returned from the API application Socket Server

### Data Fetcher
A Node.js application that polls the Trading212 API on a timer for:

  - Account values and open positions of participating users
  - A list of instruments available to buy on Trading212
  - Market opening times

This application is also responsible for deciding when to disqualify users and informing users if their Trading212 API key is no
long valid

### Socket Server
Responds to Redis events emitted from the Data Fetcher to relay new trading data to the client
