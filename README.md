Mydrive uses an implementation of Grpc Server and Grpc client with nodeJs file with MongoDb as a database

Inorder to run the code use the below commands

docker build -t mydrive:1.0.0 .

And to run the docker use the below command

docker run -p 3000:3000 --name mydrive mydrive:1.0.0



If Docker not installed Use the plain Nodejs

clone the repositery

run below commands

Install node:16.18.0 version in your system

npm install

npm run app


The monogDb here is run with MongoDb Atlas so kindly let me know the ip address so that i can give access to the same