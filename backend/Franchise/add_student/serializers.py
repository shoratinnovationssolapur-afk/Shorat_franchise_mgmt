from rest_framework import serializers
from .models import Student
from admin1.add_batch.models import Batch
from admin1.add_franchise.models import AddFranchise
import re

class StudentSerializer(serializers.ModelSerializer):
    
    # Show multiple batch names
    batch_names = serializers.SerializerMethodField()

    franchise = serializers.StringRelatedField(read_only=True)
    franchise_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)

    # Accept multiple batch IDs
    batches = serializers.PrimaryKeyRelatedField(
        queryset=Batch.objects.all(),
        many=True
    )

    class Meta:
        model = Student
        fields = [
            "id",
            "name",
            "email",
            "phone",
            "batches",          # ✅ multiple batches
            "batch_names",      # ✅ clean names
            "franchise",
            "franchise_id",
            "total_fees",
            "fees_paid",
            "status",
            "created_at",
        ]

    def get_batch_names(self, obj):
        """
        Return cleaned batch names list
        """
        names = []
        for batch in obj.batches.all():
            clean_name = re.sub(r"\s*\([^)]*\)$", "", batch.name)
            names.append(clean_name)
        return names

    def create(self, validated_data):
        franchise_id = validated_data.pop("franchise_id", None)
        batches = validated_data.pop("batches", [])

        if franchise_id:
            try:
                franchise = AddFranchise.objects.get(id=franchise_id)
                validated_data["franchise"] = franchise
            except AddFranchise.DoesNotExist:
                raise serializers.ValidationError({"franchise_id": "Invalid franchise ID."})
        else:
            user = self.context["request"].user
            validated_data["franchise"] = getattr(user, "franchise", None)

        student = Student.objects.create(**validated_data)
        student.batches.set(batches)  # ✅ assign multiple batches
        return student

    def update(self, instance, validated_data):
        franchise_id = validated_data.pop("franchise_id", None)
        batches = validated_data.pop("batches", None)

        if franchise_id:
            try:
                franchise = AddFranchise.objects.get(id=franchise_id)
                instance.franchise = franchise
            except AddFranchise.DoesNotExist:
                raise serializers.ValidationError({"franchise_id": "Invalid franchise ID."})

        if batches is not None:
            instance.batches.set(batches)  # ✅ update batches

        return super().update(instance, validated_data)