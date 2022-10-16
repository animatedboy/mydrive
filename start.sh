echo 'START.SH: ############## STARTING MYDRIVE  #################'

 
  node /mydrive/grpc_server.js

  status=$?
  if [ $status -ne 0 ]; then
    echo "Failed to start node1: $status"
    exit $status
  fi

  node /mydrive/app.js

  status=$?
  if [ $status -ne 0 ]; then
    echo "Failed to start node2: $status"
    exit $status
  fi