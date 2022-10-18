The sever is implemented with GRPC Server

#For Docker Installation:

 cd grpc_server

 ```docker build -t grpc_server:1.0.0 .

 docker run -p 50051:50051 grpc_server:1.0.0```

#For Adhoc Running with nodejs:

    ```cd grpc_server

    npm install

    npm start```

The server uses mongoDB as backend and the same is been hosted mongoDb atlas.