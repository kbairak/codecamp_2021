from django.urls import path

from . import views


urlpatterns = [
    path('<int:post_id>/vote/', views.vote),
    path('<int:post_id>/unvote/', views.unvote),
    path('<int:post_id>/', views.post),
    path('', views.posts),
]
