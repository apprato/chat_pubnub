# Chat - Pubnub
A chat system which can be used for a 2 sided marketplace, for a client and vendor with the data stored and integrated into the backend SAAS platform PubNub.

## Environment

* Node.js
* Next.js
* React (Hooks, effects etc)
* PubNub

### Restart Server Services
sudo service nginx restart && sudo service php7.2-fpm restart && sudo service mysql restart

## Description
A chat messenger system with the ability to add services in the chat to cart.
The chat is meant to connect to the Clients to Vendors.

## Install Node.js / next
```
curl -sL https://deb.nodesource.com/setup_13.x | sudo -E bash -
sudo apt-get install -y nodejs
```


### Start Application

#### Development

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or with pm2
pm2 start 'npm run dev'
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
