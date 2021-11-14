from django.db import models


class Author(models.Model):
    username = models.TextField()
    uuid = models.UUIDField()


class Post(models.Model):
    author = models.ForeignKey('posts.Author', on_delete=models.CASCADE)
    message = models.TextField()


class Vote(models.Model):
    post = models.ForeignKey('posts.Post', on_delete=models.CASCADE)
    author = models.ForeignKey('posts.Author', on_delete=models.CASCADE)

    class Meta:
        unique_together = [['post', 'author']]
