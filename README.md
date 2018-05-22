# README #

This Project is currently onlive, host on Heroku, here is the link: https://my-noqubot.herokuapp.com/

### What is this repository for? ###

* This is personal project for Kaibin Yu to keep challenge him self, welcome to anyone to contribute
* Version 1.1.0
* [Learn Markdown](https://bitbucket.org/tutorials/markdowndemo)

### How do I get set up? ###

* Node.js
* MongoDB
* Docker
* 
* Run With Docker Compose 
* export NODE_ENV=staging
* Host On: http://localhost:5000/
 
### About Docker: 
* Build Docker 
	* docker build -t your-name/noqubot .
* Check Docker Image 
	* docker images
* Run Docker Image
	* docker run -p 5000:5000 -d your-name/noqubot
* Get Containner Id
	* docker ps
* Print App Output
	* docker logs container-id
* Enter the container
	* docker exec -it container-id /bin/bash
* Docker-Compose
	* docker-compose build
	* docker-compose up
	* docker-compose up --build

* Docker Resources 
	MongoDB: https://medium.com/@sunnykay/docker-development-workflow-node-express-mongo-4bb3b1f7eb1e
	Node.js: https://nodejs.org/en/docs/guides/nodejs-docker-webapp/
	Others: https://docs.docker.com/compose/environment-variables/#the-env-file

### Contribution guidelines ###

* Writing tests
* Code review
* Other guidelines

### Who do I talk to? ###

* Author: Kaibin Yu
* Other community or team contact
* Currently only myself
