from django.urls import include, path


urlpatterns = [
    path('posts/', include("posts.urls")),
]
