from rest_framework import serializers
from .models import Events


class RegisterEventsSerializer(serializers.ModelSerializer):
    date_range_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Events
        fields = [
            'id', 'title', 'description', 'date', 'start_date', 'end_date', 
            'time', 'location', 'image_url', 'author', 'slug', 'published', 
            'created_at', 'updated_at', 'date_range_display'
        ]
        read_only_fields = ['created_at', 'updated_at', 'slug', 'date_range_display']
        extra_kwargs = {
            'start_date': {'required': False, 'allow_null': True},
            'end_date': {'required': False, 'allow_null': True},
            'date': {'required': False, 'allow_null': True},
            'time': {'required': False, 'allow_null': True},
            'author': {'required': False, 'allow_null': True},
        }
    
    def get_date_range_display(self, obj):
        return obj.get_date_range_display()
    
    def create(self, validated_data):
        # Set author from request user if not provided
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            if 'author' not in validated_data or not validated_data['author']:
                validated_data['author'] = request.user.username
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        # Set author from request user if not provided
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            if 'author' not in validated_data or not validated_data['author']:
                validated_data['author'] = request.user.username
        return super().update(instance, validated_data)
    
    def validate(self, data):
        """
        Check that start_date is before end_date if both are provided.
        """
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        
        if start_date and end_date and start_date > end_date:
            raise serializers.ValidationError("Start date must be before end date.")
        
        return data
    
    