import json

from django.db.models import Count
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .models import Author, Post, Vote


SUPERUSER_UUID = 'ebf6c7cd-152a-45a9-9857-3909481d8d3e'


@require_http_methods(["GET", "POST"])
@csrf_exempt
def posts(request):
    if request.method == "GET":
        author_uuid = request.GET['author_uuid']
        voted_by_author = set(Vote.objects.
                              filter(author__uuid=author_uuid).
                              values_list('post_id', flat=True))
        return JsonResponse({'data': [
            {'id': post['id'],
             'message': post['message'],
             'author': post['author__username'],
             'author_uuid': str(post['author__uuid']),
             'votes': post['vote__count'],
             'voted_by_you': post['id'] in voted_by_author}
            for post in (Post.objects.
                         values('id').
                         annotate(Count('vote')).
                         values('id', 'message', 'author__username',
                                'author__uuid', 'vote__count').
                         order_by('-vote__count'))
        ]})

    elif request.method == "POST":
        data = json.loads(request.body)['data']

        # Validation
        if not data['message'].strip():
            raise ValueError("Message is empty")

        # Get or create Author
        try:
            author = Author.objects.get(uuid=data['author_uuid'])
        except Author.DoesNotExist:
            author = Author.objects.create(username=data['author'],
                                           uuid=data['author_uuid'])
        else:
            if author.username != data['author']:
                author.username = data['author']
                author.save()

        # Create post
        post = Post.objects.create(message=data['message'],
                                   author=author)
        Vote.objects.create(post=post, author=author)
        return JsonResponse({'data': {'id': post.id,
                                      'message': post.message,
                                      'author': author.username,
                                      'author_uuid': str(author.uuid),
                                      'votes': 1,
                                      'voted_by_you': True}})


@require_http_methods(["DELETE"])
@csrf_exempt
def post(request, post_id):
    author_uuid = request.GET['author_uuid']
    post = Post.objects.get(id=post_id)
    if author_uuid not in (str(post.author.uuid), SUPERUSER_UUID):
        raise ValueError("You cannot delete a post that is not your own")
    post.delete()
    return HttpResponse("Ok")


@require_http_methods(["PATCH"])
@csrf_exempt
def vote(request, post_id):
    data = json.loads(request.body)['data']
    author, _ = Author.objects.get_or_create(uuid=data['author_uuid'])
    Vote.objects.create(post_id=post_id, author=author)
    return HttpResponse("Ok")


@require_http_methods(["PATCH"])
@csrf_exempt
def unvote(request, post_id):
    data = json.loads(request.body)['data']
    author, _ = Author.objects.get_or_create(uuid=data['author_uuid'])
    count, _ = Vote.objects.filter(post_id=post_id, author=author).delete()
    if count == 0:
        raise ValueError("The author has not voted for this post")
    return HttpResponse("Ok")
