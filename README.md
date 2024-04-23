# Service Health Portal
Software for service health troubleshooting.
Define all your servers, services on those servers, and status of the servies. 
In addition to that, you can define commands to perform on the services such as restart, etc.    
This software is intended to be a dashboard to see the health of all services on one page.
The health status is fetched on demand. 
This is not for monitoring, alerting, or reporting. There are well established and mature solutions for that already. 

## Structure of Project

- /server - contains the backend api. Express/NodeJS/Typescript API. 
- /client - contains the frontend. Vite/React/Typescript App.  
- /test-ssh-server - contains a docker container and bin folder containing sample bash scripts for services. 


### Server
Express/NodeJS/Typescript API

For local development
Runs on port 3001
```
cd server
npm run dev
```

### Client
- Vite/React/Typescript App
  - [Vite](https://vitejs.dev/guide/)
- React Material Web Components 
  - [rmwc 14](https://rmwc.io/)


For local development
Runs on Port 3000
```
cd client
npm run dev
```


### Test SSH Server
Docker and docker compose for sample ssh server. 
- contains bin folder with sample bash scripts for status and restart of services. 

Command to start 
```
cd test-ssh-server
docker compose up --build -d
```





## Deploy Live
```bash
cd client
npm run build
cd ../server
npm run build

```



