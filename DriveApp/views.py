import logging
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model 
from django.shortcuts import render, redirect
from django.http import JsonResponse
from DriveApp.models import UploadedFile
from django.contrib.auth.decorators import login_required
from django.core.files.storage import FileSystemStorage
from .forms import ContactForm
from django.contrib.auth import logout
from django.contrib.auth import authenticate, login
from django.contrib import messages 


#logger function
logger = logging.getLogger('DriveApp')

#index function
def  index(request):
    return render(request,'index.html')

#register function
def register(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        email = request.POST.get('email')
        password = request.POST.get('password')
        confirm_password = request.POST.get('confirm-password')
        if password != confirm_password:
            messages.error(request, "Passwords do not match.")
            return redirect('register') 
        User = get_user_model()  

        try:
           
            user = User.objects.create_user(username=username, email=email, password=password)
            user.save()
            messages.success(request, "Registration successful. Please log in.")
            return redirect('login') 
        except Exception as e:
            messages.error(request, f"Error: {e}")
            return redirect('register')  
    return render(request, 'register.html') 

#login function
def login_view(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:          
            login(request, user)
            messages.success(request, "Login successful!")
            return redirect('index') 
        else:
            messages.error(request, "Invalid login credentials. Please try again.")
            return redirect('login')
    return render(request, 'login.html')

#logout function 
def logout_view(request):
    logout(request) 
    response = redirect('login')  
    response.set_cookie('logged_out', 'true') 
    return response

#contact function 
def contact_view(request):
    if request.method == 'POST':
        form = ContactForm(request.POST)
        if form.is_valid():
            form.save() 
            return redirect('success')  
    else:
        form = ContactForm()
    return render(request, 'contact.html', {'form': form})

#success function 
def success_view(request):
    return render(request, 'index.html')

#upload function
def upload_file(request):
    if request.method == 'POST' and request.FILES.getlist('file'):
        uploaded_files = request.FILES.getlist('file')
        file_urls = []
        
        for uploaded_file in uploaded_files:
            fs = FileSystemStorage()
            file_name = fs.save(uploaded_file.name, uploaded_file)
            file_url = fs.url(file_name)
            new_file = UploadedFile(user=request.user, file=file_name)
            new_file.save()
            file_urls.append({
                'file_id': str(new_file.file_id), 
                'file_name': file_name,
                'file_url': file_url,
                'file_type': file_name.split('.')[-1]  
            })        
        return JsonResponse({'message': 'Files uploaded successfully', 'files': file_urls})
    return JsonResponse({'message': 'File upload failed'}, status=400)

# get uploaded function
def get_uploaded_files(request):
    if request.user.is_authenticated:
        files = UploadedFile.objects.filter(user=request.user).order_by('-uploaded_at')
        file_list = []

        for file in files:
            file_extension = file.file.name.split('.')[-1].lower()

            if file_extension in ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp']:
                file_type = 'image'
            elif file_extension in ['mp4', 'mkv', 'avi', 'mov', 'webm']:
                file_type = 'video'
            elif file_extension == 'mp3':
                file_type = 'audio'
            elif file_extension == 'pdf':
                file_type = 'pdf'
            elif file_extension in ['doc', 'docx']:
                file_type = 'word'
            elif file_extension in ['xls', 'xlsx']:
                file_type = 'excel'
            else:
                file_type = 'generic'  

            file_data = {
                'file_id': str(file.file_id), 
                'file_name': file.file.name,
                'file_url': file.file.url,
                'file_type': file_type,     
            }
            file_list.append(file_data)
        
        return JsonResponse({'files': file_list})
    
    return JsonResponse({'message': 'User not authenticated'}, status=401)

#search function
@login_required
def search_files(request):
    query = request.GET.get('query', '')
    user = request.user 
    results = UploadedFile.objects.filter(user=user, file__icontains=query)
    files = [{'id': file.id, 'name': file.file.name, 'url': file.file.url} for file in results]    
    return JsonResponse({'files': files})


#delete function
def delete_file(request, file_id):
    if request.method == 'DELETE':
        try:
            file = get_object_or_404(UploadedFile, file_id=file_id, user=request.user)
            file.delete()
            return JsonResponse({'status': 'success', 'message': 'File deleted successfully.'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)