from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from DriveApp import views  

urlpatterns = [  
    path('', views.index, name='index'),
    path('register/', views.register, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('upload/', views.upload_file, name='upload_file'),
    path('get_files/', views.get_uploaded_files, name='get_uploaded_files'),
    path('contact/', views.contact_view, name='contact'),
    path('success/', views.success_view, name='success'),
    path('delete-file/<uuid:file_id>/', views.delete_file, name='delete_file'),  # Use UUID file_id
    path('search_files/', views.search_files, name='search_files'),
    

]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)          