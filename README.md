# blue-green-deployment
Quote Generator App with Docker and set it up for blue-green deployment

quote-generator/
├── app/
│   ├── public/
│   │   ├── styles.css
│   │   └── script.js
│   ├── views/
│   │   └── index.html
│   ├── quotes.json
│   └── server.js
├── docker/
│   ├── blue/
│   │   └── Dockerfile
│   └── green/
│       └── Dockerfile
├── deploy/
│   ├── docker-compose.yml
│   └── deploy.sh
└── README.md