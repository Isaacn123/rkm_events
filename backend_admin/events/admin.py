from django.contrib import admin
from .models import Events
# Register your models here.
@admin.register(Events)
class EventsAdmin(admin.ModelAdmin):
    list_display = ('title', 'description', 'get_date_range', 'author', 'time', 'published')
    list_filter = ('published', 'created_at', 'author', 'start_date', 'end_date')
    search_fields = ('title', 'description')
    prepopulated_fields = {'slug': ('title',)}
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'author', 'location')
        }),
        ('Date & Time', {
            'fields': ('start_date', 'end_date', 'date', 'time'),
            'description': 'Use start_date and end_date for date ranges, or date for single day events'
        }),
        ('Media & Settings', {
            'fields': ('image_url', 'slug', 'published')
        }),
    )
    
    def get_date_range(self, obj):
        return obj.get_date_range_display()
    get_date_range.short_description = 'Date Range'