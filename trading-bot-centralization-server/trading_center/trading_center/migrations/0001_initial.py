# Generated by Django 4.0.5 on 2023-06-26 10:40

from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Position",
            fields=[
                (
                    "id",
                    models.UUIDField(editable=False, primary_key=True, serialize=False),
                ),
                ("symbol", models.CharField(max_length=255)),
                (
                    "buy_price",
                    models.DecimalField(decimal_places=2, max_digits=10, null=True),
                ),
                (
                    "sell_price",
                    models.DecimalField(decimal_places=2, max_digits=10, null=True),
                ),
                ("quantity", models.IntegerField()),
                (
                    "type",
                    models.CharField(
                        choices=[("long", "Long"), ("short", "Short")], max_length=5
                    ),
                ),
                (
                    "status",
                    models.CharField(
                        choices=[("open", "Open"), ("closed", "Closed")],
                        default="open",
                        max_length=6,
                    ),
                ),
            ],
        ),
    ]