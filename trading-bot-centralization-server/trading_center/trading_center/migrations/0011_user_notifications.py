# Generated by Django 4.2.2 on 2023-11-29 16:02

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("trading_center", "0010_user_stripe_customer_details_user_stripe_customer_id"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="notifications",
            field=models.JSONField(default=list),
        ),
    ]