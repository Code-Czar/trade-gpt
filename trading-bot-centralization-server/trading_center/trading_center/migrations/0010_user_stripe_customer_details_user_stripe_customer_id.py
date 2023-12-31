# Generated by Django 4.2.2 on 2023-11-27 13:49

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("trading_center", "0009_alter_user_id"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="stripe_customer_details",
            field=models.JSONField(default=dict),
        ),
        migrations.AddField(
            model_name="user",
            name="stripe_customer_id",
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]
