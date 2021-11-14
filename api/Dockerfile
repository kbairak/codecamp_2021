FROM python:3.9.8-alpine
WORKDIR /
RUN apk update && apk add postgresql-dev gcc python3-dev musl-dev
COPY ./requirements.txt /requirements.txt
RUN pip install -r requirements.txt
COPY ./src /app
WORKDIR /app
CMD ./manage.py runserver 0.0.0.0:8000
