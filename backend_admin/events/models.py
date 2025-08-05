from django.db import models

# Create your models here.
class Events(models.Model):
    title = models.CharField(max_length=200,null=True,blank=True)
    description = models.TextField(null=True,blank=True)
    location = models.CharField(max_length=200,null=True,blank=True)
    date = models.CharField(max_length=200,null=True,blank=True, help_text="Formatted date string or date range")
    start_date = models.DateField(null=True,blank=True, help_text="Start date of the event")
    end_date = models.DateField(null=True,blank=True, help_text="End date of the event")
    author = models.CharField(max_length=200,null=True,blank=True)
    time = models.TimeField(null=True,blank=True)
    image_url = models.URLField(null=True,blank=True)
    slug = models.SlugField(null=True,blank=True)
    published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True,null=True,blank=True)
    updated_at = models.DateTimeField(auto_now=True,null=True,blank=True)

    class Meta:
        ordering = ['-start_date', '-date']

    def __str__(self):
        return self.title
    
    def get_date_range_display(self):
        """Returns formatted date range like '20th July to 30th Sept 2025'"""
        if self.start_date and self.end_date:
            start_day = self.start_date.day
            start_month = self.start_date.strftime('%B')
            start_year = self.start_date.year
            
            end_day = self.end_date.day
            end_month = self.end_date.strftime('%B')
            end_year = self.end_date.year
            
            # Add ordinal suffix to days
            def get_ordinal_suffix(day):
                if 10 <= day % 100 <= 20:
                    suffix = 'th'
                else:
                    suffix = {1: 'st', 2: 'nd', 3: 'rd'}.get(day % 10, 'th')
                return f"{day}{suffix}"
            
            start_ordinal = get_ordinal_suffix(start_day)
            end_ordinal = get_ordinal_suffix(end_day)
            
            if start_year == end_year:
                if start_month == end_month:
                    return f"{start_ordinal} to {end_ordinal} {start_month} {start_year}"
                else:
                    return f"{start_ordinal} {start_month} to {end_ordinal} {end_month} {start_year}"
            else:
                return f"{start_ordinal} {start_month} {start_year} to {end_ordinal} {end_month} {end_year}"
        elif self.date:
            # If date field contains a formatted string, return it directly
            return self.date
        return "No date specified"