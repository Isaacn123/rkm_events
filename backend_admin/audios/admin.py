from django.contrib import admin
from .models import Audio

@admin.register(Audio)
class AudioAdmin(admin.ModelAdmin):
    list_display = ['title', 'artist', 'format', 'duration_formatted', 'file_size_mb', 'is_public', 'is_featured', 'published', 'uploaded_by', 'created_at']
    list_filter = ['is_public', 'is_featured', 'published', 'format', 'genre', 'year', 'created_at']
    search_fields = ['title', 'description', 'artist', 'album']
    readonly_fields = ['created_at', 'updated_at', 'file_size', 'file_size_mb', 'duration_formatted']
    list_editable = ['is_public', 'is_featured', 'published']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'audio_file', 'artist', 'album', 'genre', 'year')
        }),
        ('Cover Image', {
            'fields': ('cover_image', 'cover_image_name'),
            'classes': ('collapse',)
        }),
        ('Backblaze B2', {
            'fields': ('b2_file_name', 'b2_file_id', 'b2_download_url'),
            'classes': ('collapse',)
        }),
        ('Status & Visibility', {
            'fields': ('is_public', 'is_featured', 'published')
        }),
        ('Relationships', {
            'fields': ('uploaded_by', 'related_events')
        }),
        ('Metadata', {
            'fields': ('duration', 'file_size', 'format', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def save_model(self, request, obj, form, change):
        if not change:  # Only for new objects
            obj.uploaded_by = request.user
        super().save_model(request, obj, form, change)
    
    actions = ['publish_selected', 'unpublish_selected', 'make_featured', 'remove_featured']
    
    def publish_selected(self, request, queryset):
        updated = queryset.update(published=True)
        self.message_user(request, f'{updated} audio(s) were successfully published.')
    publish_selected.short_description = "Publish selected audios"
    
    def unpublish_selected(self, request, queryset):
        updated = queryset.update(published=False)
        self.message_user(request, f'{updated} audio(s) were successfully unpublished.')
    unpublish_selected.short_description = "Unpublish selected audios"
    
    def make_featured(self, request, queryset):
        updated = queryset.update(is_featured=True)
        self.message_user(request, f'{updated} audio(s) were successfully featured.')
    make_featured.short_description = "Make selected audios featured"
    
    def remove_featured(self, request, queryset):
        updated = queryset.update(is_featured=False)
        self.message_user(request, f'{updated} audio(s) were successfully unfeatured.')
    remove_featured.short_description = "Remove featured status from selected audios"
