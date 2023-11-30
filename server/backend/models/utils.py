from django.db import models

class CustomModel(models.Model):
    
    class Meta:
        abstract = True
    
    def to_dict(self, fields=[]):
        return {field: getattr(self, field) for field in fields}