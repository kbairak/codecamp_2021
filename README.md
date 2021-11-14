# Development mode

```sh
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

or

```sh
export COMPOSE_FILE='docker-compose.yml:docker-compose.dev.yml'
docker-compose up -d
```

It is possible that the `api` service started before `db` was ready. If this is
the case, it won't be able to connect to it. Fix this with:

```sh
docker-compose restart api
```

The first time you start this, you have to run the database migrations:

```sh
docker-compose exec api ./manage.py migrate
```

# Production mode

You will have to start by provisioning a remote docker host. Using Digital
Ocean as an example cloud provider.

First you need to generate an API token in digital ocean's UI. Then:

```sh
export DOTOKEN='...'

# Provision a remote docker host
docker-machine create \
    --driver digitalocean \
    --digitalocean-access-token $DOTOKEN \
    --digitalocean-image centos-8-x64 \
    codecamp

# Configure local docker clients to talk to remote docker host
eval $(docker-machine env codecamp)

# Make sure COMPOSE_FILE is empty
unset COMPOSE_FILE

docker-compose up -d
```

You can now view the application by visiting the remote host's IP address. Get
it in Digital Ocean's UI or with:

```sh
docker-machine ip codecamp
```
